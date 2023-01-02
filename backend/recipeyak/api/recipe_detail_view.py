from __future__ import annotations

from datetime import datetime

from django.db import connection
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import MethodNotAllowed, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.base.serialization import RequestParams, StrTrimmed
from recipeyak.api.serializers.recipe import RecipeSerializer
from recipeyak.models import (
    ChangeType,
    RecipeChange,
    TimelineEvent,
    filter_recipe_or_404,
    get_team,
)
from recipeyak.models.upload import Upload


def recipe_get_view(request: AuthedRequest, recipe_pk: str) -> Response:
    team = get_team(request)
    recipe = filter_recipe_or_404(recipe_pk=recipe_pk, team=team)
    with connection.cursor() as cursor:
        cursor.execute(
            """
            INSERT INTO recipe_view (recipe_id, user_id, last_visited_at, count, created, modified)
            VALUES (%(recipe_id)s, %(user_id)s, now(), 1, now(), now())
            ON CONFLICT
            ON CONSTRAINT one_user_view_row_per_recipe
            DO UPDATE SET
                last_visited_at =
                    CASE WHEN recipe_view.last_visited_at < now() - '1 hour'::interval THEN
                        now()
                    ELSE
                        recipe_view.last_visited_at
                    END,
                count =
                    CASE WHEN recipe_view.last_visited_at < now() - '1 hour'::interval THEN
                        recipe_view.count + 1
                    ELSE
                        recipe_view.count
                    END
            """,
            {"user_id": request.user.id, "recipe_id": recipe.id},
        )

    return Response(RecipeSerializer(recipe).data)


class RecipePatchParams(RequestParams):
    name: StrTrimmed | None = None
    author: StrTrimmed | None = None
    time: StrTrimmed | None = None
    tags: list[StrTrimmed] | None = None
    servings: StrTrimmed | None = None
    source: StrTrimmed | None = None
    archived_at: datetime | None = None

    # attributes requiring custom handling.
    primaryImageId: str | None = None


def recipe_patch_view(request: AuthedRequest, recipe_pk: str) -> Response:
    team = get_team(request)
    recipe = filter_recipe_or_404(recipe_pk=recipe_pk, team=team)

    params = RecipePatchParams.parse_obj(request.data)
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
            recipe.primary_image.pk if recipe.primary_image else None
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
                    raise ValidationError(
                        "Could not find upload with provided Id",
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

    team = get_team(request)
    recipe = filter_recipe_or_404(team=team, recipe_pk=recipe_pk)
    return Response(RecipeSerializer(recipe).data)


def recipe_delete_view(request: AuthedRequest, recipe_pk: str) -> Response:
    team = get_team(request)
    recipe = filter_recipe_or_404(team=team, recipe_pk=recipe_pk)
    recipe.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def receipe_detail_view(request: AuthedRequest, recipe_pk: str) -> Response:
    if request.method == "GET":
        return recipe_get_view(request, recipe_pk)
    elif request.method == "PATCH":
        return recipe_patch_view(request, recipe_pk)
    elif request.method == "DELETE":
        return recipe_delete_view(request, recipe_pk)
    raise MethodNotAllowed(request.method or "")
