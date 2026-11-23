from __future__ import annotations

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.serialization import Params
from recipeyak.api.serializers.recipe import RecipeSerializer, serialize_recipe
from recipeyak.models import (
    filter_recipe_or_404,
    get_team,
)


class RecipeRetrieveParams(Params):
    recipe_id: int


@endpoint()
def recipe_retrieve_view(
    request: AuthedHttpRequest, params: RecipeRetrieveParams
) -> RecipeSerializer:
    team = get_team(request.user)
    recipe = filter_recipe_or_404(recipe_id=params.recipe_id, team=team)
    return serialize_recipe(recipe, user=request.user)
