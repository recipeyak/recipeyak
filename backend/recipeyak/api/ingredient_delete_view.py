from __future__ import annotations

from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.serializers.recipe import ingredient_to_text
from recipeyak.models import ChangeType, RecipeChange, filter_ingredients, get_team


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def ingredient_delete_view(
    request: AuthedRequest, ingredient_id: int, recipe_id: object = ()
) -> Response:
    team = get_team(request.user)
    ingredient = get_object_or_404(filter_ingredients(team=team), pk=ingredient_id)
    RecipeChange.objects.create(
        recipe=ingredient.recipe,
        actor=request.user,
        before=ingredient_to_text(ingredient),
        after="",
        change_type=ChangeType.INGREDIENT_DELETE,
    )
    filter_ingredients(team=team).filter(pk=ingredient_id).delete()
    return Response(status=204)
