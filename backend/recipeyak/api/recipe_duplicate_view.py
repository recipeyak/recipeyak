from __future__ import annotations

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from django.shortcuts import get_object_or_404
from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.serializers.recipe import RecipeSerializer
from recipeyak.models import user_and_team_recipes


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def recipe_duplicate_view(request: AuthedRequest, recipe_pk: int) -> Response:
    recipe = get_object_or_404(user_and_team_recipes(request.user), pk=recipe_pk)
    return Response(
        RecipeSerializer(
            recipe.duplicate(actor=request.user), dangerously_allow_db=True
        ).data
    )
