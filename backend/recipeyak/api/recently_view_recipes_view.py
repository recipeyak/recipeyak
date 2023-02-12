from __future__ import annotations

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.models import RecipeView, get_team


@api_view(["GET"])
@permission_classes((IsAuthenticated,))
def get_recently_viewed_recipes(request: AuthedRequest) -> Response:
    team = get_team(request)
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
    return Response(recipes)
