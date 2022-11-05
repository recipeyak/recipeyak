from __future__ import annotations

from django.db import connection
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.api.base.request import AuthedRequest
from core.models import (
    ChangeType,
    RecipeChange,
    TimelineEvent,
    user_and_team_recipe_or_404,
)
from core.recipes.serializers import RecipeSerializer


def recipe_get_view(request: AuthedRequest, recipe_pk: str) -> Response:
    recipe = user_and_team_recipe_or_404(user=request.user, recipe_pk=recipe_pk)
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


def recipe_patch_view(request: AuthedRequest, recipe_pk: str) -> Response:
    recipe = user_and_team_recipe_or_404(user=request.user, recipe_pk=recipe_pk)
    serializer = RecipeSerializer(recipe, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)

    changes = []
    fields = [
        ("name", ChangeType.NAME),
        ("author", ChangeType.AUTHOR),
        ("source", ChangeType.SOURCE),
        ("servings", ChangeType.SERVINGS),
        ("time", ChangeType.TIME),
    ]
    for field, change_type in fields:
        if (
            field in serializer.validated_data
            and getattr(recipe, field) != serializer.validated_data[field]
        ):
            changes.append(
                RecipeChange(
                    recipe=recipe,
                    actor=request.user,
                    before=getattr(recipe, field) or "",
                    after=serializer.validated_data[field],
                    change_type=change_type,
                )
            )

    RecipeChange.objects.bulk_create(changes)

    if (
        "archived_at" in serializer.validated_data
        and getattr(recipe, "archived_at") != serializer.validated_data["archived_at"]
    ):
        TimelineEvent(
            action=(
                "archived" if serializer.validated_data["archived_at"] else "unarchived"
            ),
            created_by=request.user,
            recipe=recipe,
        ).save()

    serializer.save()

    return Response(RecipeSerializer(recipe).data)


def recipe_delete_view(request: AuthedRequest, recipe_pk: str) -> Response:
    recipe = user_and_team_recipe_or_404(user=request.user, recipe_pk=recipe_pk)
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
