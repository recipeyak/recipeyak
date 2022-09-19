from __future__ import annotations

from typing import Optional

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.models import ChangeType, Ingredient, RecipeChange, user_and_team_recipes
from core.recipes.serializers import ingredient_to_text, serialize_ingredient
from core.request import AuthedRequest
from core.serialization import RequestParams


class IngredientCreateParams(RequestParams):
    quantity: str
    name: str
    description: str
    position: str
    optional: Optional[bool] = None


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def ingredients_list_view(request: AuthedRequest, recipe_pk: int) -> Response:
    params = IngredientCreateParams.parse_obj(request.data)
    recipe = get_object_or_404(user_and_team_recipes(request.user), pk=recipe_pk)

    ingredient = Ingredient(
        quantity=params.quantity,
        name=params.name,
        description=params.description,
        recipe=recipe,
        position=params.position,
    )
    if params.optional is not None:
        ingredient.optional = params.optional
    ingredient.save()

    RecipeChange.objects.create(
        recipe=recipe,
        actor=request.user,
        before="",
        after=ingredient_to_text(ingredient),
        change_type=ChangeType.INGREDIENT_CREATE,
    )
    return Response(serialize_ingredient(ingredient), status=status.HTTP_201_CREATED)
