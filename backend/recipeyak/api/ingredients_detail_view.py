from __future__ import annotations

from typing import Optional

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.base.serialization import RequestParams
from recipeyak.api.serializers.recipe import ingredient_to_text, serialize_ingredient
from recipeyak.models import ChangeType, RecipeChange, user_and_team_ingredients


class IngredientsPatchParams(RequestParams):
    quantity: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    position: Optional[str] = None
    optional: Optional[bool] = None


@api_view(["PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def ingredients_detail_view(
    request: AuthedRequest, ingredient_pk: int, recipe_pk: object = None
) -> Response:
    if request.method == "PATCH":
        params = IngredientsPatchParams.parse_obj(request.data)
        ingredient = get_object_or_404(
            user_and_team_ingredients(request.user), pk=ingredient_pk
        )

        before = ingredient_to_text(ingredient)

        if params.quantity is not None:
            ingredient.quantity = params.quantity
        if params.name is not None:
            ingredient.name = params.name
        if params.description is not None:
            ingredient.description = params.description
        if params.position is not None:
            ingredient.position = params.position
        if params.optional is not None:
            ingredient.optional = params.optional

        ingredient.save()

        after = ingredient_to_text(ingredient)

        RecipeChange.objects.create(
            recipe=ingredient.recipe,
            actor=request.user,
            before=before,
            after=after,
            change_type=ChangeType.INGREDIENT_UPDATE,
        )

        return Response(serialize_ingredient(ingredient))

    if request.method == "DELETE":
        ingredient = get_object_or_404(
            user_and_team_ingredients(request.user), pk=ingredient_pk
        )
        RecipeChange.objects.create(
            recipe=ingredient.recipe,
            actor=request.user,
            before=ingredient_to_text(ingredient),
            after="",
            change_type=ChangeType.INGREDIENT_DELETE,
        )
        user_and_team_ingredients(request.user).filter(pk=ingredient_pk).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    raise MethodNotAllowed(request.method or "")
