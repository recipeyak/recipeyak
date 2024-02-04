from __future__ import annotations

from typing import Annotated

from django.shortcuts import get_object_or_404
from pydantic import StringConstraints

from recipeyak import ordering
from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.api.base.serialization import RequestParams
from recipeyak.api.serializers.recipe import (
    IngredientResponse,
    ingredient_to_text,
    serialize_ingredient,
)
from recipeyak.models import (
    ChangeType,
    Ingredient,
    RecipeChange,
    filter_recipes,
    get_team,
)
from recipeyak.models.section import Section
from recipeyak.realtime import publish_recipe


class IngredientCreateParams(RequestParams):
    quantity: Annotated[str, StringConstraints(strip_whitespace=True)]
    name: Annotated[str, StringConstraints(strip_whitespace=True)]
    description: Annotated[str, StringConstraints(strip_whitespace=True)]
    position: str | None = None
    optional: bool | None = None


@endpoint()
def ingredient_create_view(
    request: AuthedHttpRequest[IngredientCreateParams], recipe_id: int
) -> JsonResponse[IngredientResponse]:
    params = IngredientCreateParams.parse_raw(request.body)
    team = get_team(request.user)
    recipe = get_object_or_404(filter_recipes(team=team), pk=recipe_id)

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
        last_section = Section.objects.filter(recipe=recipe).last()
        last_ingredient = recipe.ingredient_set.last()
        last_item = last_section or last_ingredient
        if last_item is not None:
            ingredient.position = ordering.position_after(last_item.position)
        else:
            ingredient.position = ordering.FIRST_POSITION
    ingredient.save()
    publish_recipe(recipe_id=recipe.id, team_id=team.id)

    RecipeChange.objects.create(
        recipe=recipe,
        actor=request.user,
        before="",
        after=ingredient_to_text(ingredient),
        change_type=ChangeType.INGREDIENT_CREATE,
    )
    return JsonResponse(serialize_ingredient(ingredient), status=201)
