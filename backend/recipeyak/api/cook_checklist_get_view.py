from __future__ import annotations

from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.models import (
    filter_cook_checklist,
    get_team,
)


def cook_checklist_get_view(request: AuthedRequest, recipe_pk: str) -> Response:
    team = get_team(request)
    recipe_checklist_items = filter_cook_checklist(team=team).filter(
        recipe_id=recipe_pk
    )

    return Response(
        {x["ingredient_id"]: x["checked"] for x in recipe_checklist_items.values()}
    )
