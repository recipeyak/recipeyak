from __future__ import annotations

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.models import (
    filter_cook_checklist,
    get_team,
)


@endpoint()
def cook_checklist_retrieve_view(
    request: AuthedHttpRequest[None], recipe_id: str
) -> JsonResponse[dict[int, bool]]:
    team = get_team(request.user)
    recipe_checklist_items = filter_cook_checklist(team=team).filter(
        recipe_id=recipe_id
    )

    return JsonResponse(
        {x["ingredient_id"]: x["checked"] for x in recipe_checklist_items.values()}
    )
