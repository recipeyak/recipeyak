from __future__ import annotations

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.api.base.serialization import Params
from recipeyak.models import user_reactions
from recipeyak.realtime import publish_recipe


class ReactionDeleteParams(Params):
    reaction_id: str


@endpoint()
def reaction_delete_view(
    request: AuthedHttpRequest, params: ReactionDeleteParams
) -> JsonResponse[None]:
    if (
        reaction := user_reactions(user=request.user)
        .filter(pk=params.reaction_id)
        .first()
    ):
        recipe = reaction.note.recipe
        reaction.delete()
        if recipe.team_id:
            publish_recipe(recipe_id=recipe.id, team_id=recipe.team_id)
    return JsonResponse(None, status=204)
