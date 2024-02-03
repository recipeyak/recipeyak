from __future__ import annotations

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.models import (
    filter_recipe_or_404,
    get_team,
)


@endpoint()
def recipe_delete_view(
    request: AuthedHttpRequest[None], recipe_id: int
) -> JsonResponse[None]:
    team = get_team(request.user)
    recipe = filter_recipe_or_404(team=team, recipe_id=recipe_id)
    recipe.delete()
    return JsonResponse(None, status=204)
