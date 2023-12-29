from __future__ import annotations

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.models import RecipeView, get_team


@endpoint()
def recipe_recently_viewed_view(request: AuthedHttpRequest) -> JsonResponse:
    team = get_team(request.user)
    recipes = [
        {
            "id": rv.recipe.id,
            "name": rv.recipe.name,
            "author": rv.recipe.author,
            "archivedAt": rv.recipe.archived_at,
            "primaryImage": {
                "id": rv.recipe.primary_image.id,
                "url": rv.recipe.primary_image.public_url(),
                "backgroundUrl": rv.recipe.primary_image.background_url,
            }
            if rv.recipe.primary_image is not None
            else None,
        }
        for rv in RecipeView.objects.select_related("recipe__primary_image")
        .filter(user=request.user)
        .filter(recipe__team=team)
        .order_by("-last_visited_at")[:6]
    ]
    return JsonResponse(recipes)
