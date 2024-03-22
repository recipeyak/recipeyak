from __future__ import annotations

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.api.base.serialization import Params
from recipeyak.models import (
    filter_cook_checklist,
    get_team,
)


class CookChecklistRetrieveParams(Params):
    recipe_id: int


@endpoint()
def cook_checklist_retrieve_view(
    request: AuthedHttpRequest, params: CookChecklistRetrieveParams
) -> JsonResponse[dict[int, bool]]:
    team = get_team(request.user)
    recipe_checklist_items = filter_cook_checklist(team=team).filter(
        recipe_id=params.recipe_id
    )

    return JsonResponse(
        {x["ingredient_id"]: x["checked"] for x in recipe_checklist_items.values()}
    )
