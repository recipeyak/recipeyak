from __future__ import annotations

from typing import Annotated

from django.shortcuts import get_object_or_404
from pydantic import StringConstraints

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.api.base.serialization import RequestParams
from recipeyak.api.serializers.recipe import ingredient_to_text, serialize_ingredient
from recipeyak.models import ChangeType, RecipeChange, filter_ingredients, get_team


class IngredientsPatchParams(RequestParams):
    quantity: Annotated[str, StringConstraints(strip_whitespace=True)] | None = None
    name: Annotated[str, StringConstraints(strip_whitespace=True)] | None = None
    description: Annotated[str, StringConstraints(strip_whitespace=True)] | None = None
    position: str | None = None
    optional: bool | None = None


@endpoint()
def ingredient_update_view(
    request: AuthedHttpRequest, ingredient_id: int
) -> JsonResponse:
    team = get_team(request.user)
    params = IngredientsPatchParams.parse_raw(request.body)
    ingredient = get_object_or_404(filter_ingredients(team=team), pk=ingredient_id)

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

    return JsonResponse(serialize_ingredient(ingredient))
