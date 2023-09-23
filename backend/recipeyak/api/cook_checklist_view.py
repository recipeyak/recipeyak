from __future__ import annotations

from datetime import datetime

import pydantic
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
    filter_cook_checklist,
    filter_recipe_or_404,
    get_team,
)
from recipeyak.models.recipe_cook_checklist_check import RecipeCookChecklistCheck
from recipeyak.models.upload import Upload


def cook_checklist_get_view(request: AuthedRequest, recipe_pk: str) -> Response:
    team = get_team(request)
    recipe_checklist_items = filter_cook_checklist(team=team).filter(
        recipe_id=recipe_pk
    )

    return Response(
        {x["ingredient_id"]: x["checked"] for x in recipe_checklist_items.values()}
    )


class CookChecklistPostSerializer(pydantic.BaseModel):
    ingredient_id: int
    checked: bool


class CookChecklistPostParams(RequestParams):
    ingredient_id: int
    checked: bool


def cook_checklist_post_view(request: AuthedRequest, recipe_pk: str) -> Response:
    team = get_team(request)
    recipe = filter_recipe_or_404(recipe_pk=recipe_pk, team=team)

    params = CookChecklistPostParams.parse_obj(request.data)
    with connection.cursor() as cursor:
        cursor.execute(
            """
            insert into recipe_cook_checklist_check (recipe_id, ingredient_id, checked, created, modified)
            values (%(recipe_id)s, %(ingredient_id)s, %(checked)s, now(), now())
            on conflict
                on constraint recipe_ingredient_uniq
                do update set checked = EXCLUDED.checked, modified = now()
            """,
            {
                "recipe_id": recipe.id,
                "ingredient_id": params.ingredient_id,
                "checked": params.checked,
            },
        )

    return Response(
        CookChecklistPostSerializer(
            ingredient_id=params.ingredient_id, checked=params.checked
        )
    )


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def cook_checklist_view(request: AuthedRequest, recipe_pk: str) -> Response:
    if request.method == "GET":
        return cook_checklist_get_view(request, recipe_pk)
    if request.method == "POST":
        return cook_checklist_post_view(request, recipe_pk)
    raise MethodNotAllowed(request.method or "")
