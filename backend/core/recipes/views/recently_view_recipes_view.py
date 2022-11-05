from __future__ import annotations

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.api.request import AuthedRequest
from core.models import RecipeView


@api_view(["GET"])
@permission_classes((IsAuthenticated,))
def get_recently_viewed_recipes(request: AuthedRequest) -> Response:
    recipes = [
        {"id": rv.recipe.id, "name": rv.recipe.name}
        for rv in RecipeView.objects.select_related("recipe")
        .filter(user=request.user)
        .order_by("-last_visited_at")[:6]
    ]
    return Response(recipes)
