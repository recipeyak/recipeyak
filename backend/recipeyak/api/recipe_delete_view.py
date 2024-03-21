from __future__ import annotations

from django.db import transaction

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.api.base.serialization import RequestParams
from recipeyak.models import (
    filter_recipe_or_404,
    get_team,
)
from recipeyak.realtime import publish_recipe


class RecipeDeleteParams(RequestParams):
    recipe_id: int


@endpoint()
def recipe_delete_view(
    request: AuthedHttpRequest, params: RecipeDeleteParams
) -> JsonResponse[None]:
    team = get_team(request.user)
    with transaction.atomic():
        recipe = filter_recipe_or_404(team=team, recipe_id=params.recipe_id)
        recipe.delete()
        # no need to save version, since we aren't "updating" the recipe, we
        # have the previous post-update version saved already
    publish_recipe(recipe_id=recipe.id, team_id=team.id)
    return JsonResponse(None, status=204)
