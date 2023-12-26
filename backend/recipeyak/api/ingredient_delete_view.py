from __future__ import annotations

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.serializers.recipe import ingredient_to_text
from recipeyak.models import ChangeType, RecipeChange, filter_ingredients, get_team


def ingredient_delete_view(request: AuthedRequest, ingredient_pk: int) -> Response:
    team = get_team(request)
    ingredient = get_object_or_404(filter_ingredients(team=team), pk=ingredient_pk)
    RecipeChange.objects.create(
        recipe=ingredient.recipe,
        actor=request.user,
        before=ingredient_to_text(ingredient),
        after="",
        change_type=ChangeType.INGREDIENT_DELETE,
    )
    filter_ingredients(team=team).filter(pk=ingredient_pk).delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
