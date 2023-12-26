from __future__ import annotations

from django.shortcuts import get_object_or_404
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.base.serialization import RequestParams, StrTrimmed
from recipeyak.api.serializers.recipe import ingredient_to_text, serialize_ingredient
from recipeyak.models import ChangeType, RecipeChange, filter_ingredients, get_team


class IngredientsPatchParams(RequestParams):
    quantity: StrTrimmed | None = None
    name: StrTrimmed | None = None
    description: StrTrimmed | None = None
    position: str | None = None
    optional: bool | None = None


def ingredient_update_view(request: AuthedRequest, ingredient_pk: int) -> Response:
    team = get_team(request)
    params = IngredientsPatchParams.parse_obj(request.data)
    ingredient = get_object_or_404(filter_ingredients(team=team), pk=ingredient_pk)

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
