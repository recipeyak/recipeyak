from __future__ import annotations

import pydantic
from django.db import connection

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.api.base.serialization import Params
from recipeyak.models import (
    filter_recipe_or_404,
    get_team,
)
from recipeyak.realtime import publish_cook_checklist


class CookChecklistCreateResponse(pydantic.BaseModel):
    ingredient_id: int
    checked: bool


class CookChecklistCreateParams(Params):
    ingredient_id: int
    checked: bool
    recipe_id: int


@endpoint()
def cook_checklist_create_view(
    request: AuthedHttpRequest, params: CookChecklistCreateParams
) -> JsonResponse[CookChecklistCreateResponse]:
    team = get_team(request.user)
    recipe = filter_recipe_or_404(recipe_id=params.recipe_id, team=team)
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

    return JsonResponse(
        CookChecklistCreateResponse(
            ingredient_id=params.ingredient_id, checked=params.checked
        )
    )
