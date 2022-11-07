from __future__ import annotations

from typing import Optional

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from django.shortcuts import get_object_or_404
from recipeyak import ordering
from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.base.serialization import RequestParams
from recipeyak.api.serializers.recipe import ingredient_to_text, serialize_ingredient
from recipeyak.models import ChangeType, Ingredient, RecipeChange, user_and_team_recipes


class IngredientCreateParams(RequestParams):
    quantity: str
    name: str
    description: str
    position: Optional[str] = None
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
    )
    if params.optional is not None:
        ingredient.optional = params.optional
    if params.position is not None:
        ingredient.position = params.position
    else:
        last_section = recipe.section_set.last()
        last_ingredient = recipe.ingredient_set.last()
        last_item = last_section or last_ingredient
        if last_item is not None:
            ingredient.position = ordering.position_after(last_item.position)
        else:
            ingredient.position = ordering.FIRST_POSITION
    ingredient.save()

    RecipeChange.objects.create(
        recipe=recipe,
        actor=request.user,
        before="",
        after=ingredient_to_text(ingredient),
        change_type=ChangeType.INGREDIENT_CREATE,
    )
    return Response(serialize_ingredient(ingredient), status=status.HTTP_201_CREATED)
