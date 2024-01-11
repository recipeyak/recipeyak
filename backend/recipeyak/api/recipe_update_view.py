from __future__ import annotations

from datetime import datetime
from typing import Annotated

from pydantic import StringConstraints

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.api.base.serialization import RequestParams
from recipeyak.api.serializers.recipe import serialize_recipe
from recipeyak.models import (
    ChangeType,
    RecipeChange,
    TimelineEvent,
    filter_recipe_or_404,
    get_team,
)
from recipeyak.models.upload import Upload


class RecipePatchParams(RequestParams):
    name: Annotated[str, StringConstraints(strip_whitespace=True)] | None = None
    author: Annotated[str, StringConstraints(strip_whitespace=True)] | None = None
    time: Annotated[str, StringConstraints(strip_whitespace=True)] | None = None
    tags: list[Annotated[str, StringConstraints(strip_whitespace=True)]] | None = None
    servings: Annotated[str, StringConstraints(strip_whitespace=True)] | None = None
    source: Annotated[str, StringConstraints(strip_whitespace=True)] | None = None
    archived_at: datetime | None = None

    # attributes requiring custom handling.
    primaryImageId: str | None = None


@endpoint()
def recipe_update_view(request: AuthedHttpRequest, recipe_id: str) -> JsonResponse:
    team = get_team(request.user)
    recipe = filter_recipe_or_404(recipe_id=recipe_id, team=team)

    params = RecipePatchParams.parse_raw(request.body)
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

    if "archived_at" in provided_fields and recipe.archived_at != params.archived_at:
        TimelineEvent(
            action=("archived" if params.archived_at else "unarchived"),
            created_by=request.user,
            recipe=recipe,
        ).save()

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
                    return JsonResponse(
                        {
                            "error": {
                                "message": "Could not find upload with provided Id"
                            }
                        },
                        status=400,
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

    team = get_team(request.user)
    recipe = filter_recipe_or_404(team=team, recipe_id=recipe_id)
    return JsonResponse(serialize_recipe(recipe))
