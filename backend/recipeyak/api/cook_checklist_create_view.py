from __future__ import annotations

import pydantic
from django.db import connection
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.base.serialization import RequestParams
from recipeyak.models import (
    filter_recipe_or_404,
    get_team,
)
from recipeyak.realtime import publish_cook_checklist


class CookChecklistPostSerializer(pydantic.BaseModel):
    ingredient_id: int
    checked: bool


class CookChecklistPostParams(RequestParams):
    ingredient_id: int
    checked: bool


def cook_checklist_create_view(request: AuthedRequest, recipe_pk: str) -> Response:
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

    publish_cook_checklist(
        recipe_id=recipe.id,
        team_id=team.id,
        ingredient_id=params.ingredient_id,
        checked=params.checked,
    )

    return Response(
        CookChecklistPostSerializer(
            ingredient_id=params.ingredient_id, checked=params.checked
        )
    )
