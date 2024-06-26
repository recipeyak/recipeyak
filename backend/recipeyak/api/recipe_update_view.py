from __future__ import annotations

from datetime import datetime
from typing import Annotated

from django.db import transaction
from pydantic import StringConstraints

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.exceptions import APIError
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.serialization import Params
from recipeyak.api.serializers.recipe import RecipeSerializer, serialize_recipe
from recipeyak.models import (
    ChangeType,
    RecipeChange,
    TimelineEvent,
    filter_recipe_or_404,
    get_team,
)
from recipeyak.models.recipe_favorite import RecipeFavorite
from recipeyak.models.upload import Upload
from recipeyak.realtime import publish_recipe
from recipeyak.versioning import save_recipe_version


class RecipeUpdateParams(Params):
    name: Annotated[str, StringConstraints(strip_whitespace=True)] | None = None
    author: Annotated[str, StringConstraints(strip_whitespace=True)] | None = None
    time: Annotated[str, StringConstraints(strip_whitespace=True)] | None = None
    tags: list[Annotated[str, StringConstraints(strip_whitespace=True)]] | None = None
    servings: Annotated[str, StringConstraints(strip_whitespace=True)] | None = None
    source: Annotated[str, StringConstraints(strip_whitespace=True)] | None = None
    archived_at: datetime | None = None
    user_favorite: bool | None = None

    # attributes requiring custom handling.
    primaryImageId: str | None = None

    recipe_id: int


@endpoint()
def recipe_update_view(
    request: AuthedHttpRequest, params: RecipeUpdateParams
) -> RecipeSerializer:
    team = get_team(request.user)
    recipe = filter_recipe_or_404(recipe_id=params.recipe_id, team=team)

    with transaction.atomic():
        provided_fields = set(params.dict(exclude_unset=True))
        changes = []
        fields = [
            ("name", ChangeType.NAME),
            ("author", ChangeType.AUTHOR),
            ("source", ChangeType.SOURCE),
            ("servings", ChangeType.SERVINGS),
            ("time", ChangeType.TIME),
        ]
        for field, change_type in fields:
            if field in provided_fields and getattr(recipe, field) != getattr(
                params, field
            ):
                changes.append(
                    RecipeChange(
                        recipe=recipe,
                        actor=request.user,
                        before=getattr(recipe, field) or "",
                        after=getattr(params, field) or "",
                        change_type=change_type,
                    )
                )

        RecipeChange.objects.bulk_create(changes)

        if (
            "archived_at" in provided_fields
            and recipe.archived_at != params.archived_at
        ):
            TimelineEvent(
                action=("archived" if params.archived_at else "unarchived"),
                created_by=request.user,
                recipe=recipe,
            ).save()

        if params.user_favorite is not None:
            if params.user_favorite:
                RecipeFavorite.objects.get_or_create(recipe=recipe, user=request.user)
            else:
                RecipeFavorite.objects.filter(recipe=recipe, user=request.user).delete()

        for field in provided_fields & {
            "name",
            "author",
            "time",
            "tags",
            "servings",
            "source",
            "archived_at",
        }:
            setattr(recipe, field, getattr(params, field))

        if "primaryImageId" in provided_fields:
            existing_primary_image_id = (
                str(recipe.primary_image.pk) if recipe.primary_image else None
            )
            if params.primaryImageId != existing_primary_image_id:
                if params.primaryImageId is None:
                    recipe.primary_image = None
                    timeline_action = "remove_primary_image"
                    upload = None
                else:
                    upload = Upload.objects.filter(
                        recipe=recipe, id=params.primaryImageId
                    ).first()
                    if upload is None:
                        raise APIError(
                            code="unknown_upload",
                            message="Could not find upload with provided Id",
                        )
                    recipe.primary_image = upload
                    timeline_action = "set_primary_image"
                TimelineEvent(
                    action=timeline_action,
                    created_by=request.user,
                    recipe=recipe,
                    upload=upload,
                ).save()
        recipe.save()
        save_recipe_version(recipe_id=recipe.id, actor=request.user)
    publish_recipe(recipe_id=recipe.id, team_id=team.id)

    team = get_team(request.user)
    recipe = filter_recipe_or_404(team=team, recipe_id=params.recipe_id)
    return serialize_recipe(recipe, user=request.user)
