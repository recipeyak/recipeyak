from __future__ import annotations

from typing import Annotated

from django.db import transaction
from django.shortcuts import get_object_or_404
from pydantic import StringConstraints

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
from recipeyak.realtime import publish_recipe
from recipeyak.versioning import save_recipe_version


class IngredientCreateParams(RequestParams):
    quantity: Annotated[str, StringConstraints(strip_whitespace=True)]
    name: Annotated[str, StringConstraints(strip_whitespace=True)]
    description: Annotated[str, StringConstraints(strip_whitespace=True)]
    position: str
    optional: bool | None = None


@endpoint()
def ingredient_create_view(
    request: AuthedHttpRequest[IngredientCreateParams], recipe_id: int
) -> JsonResponse[IngredientResponse]:
    params = IngredientCreateParams.parse_raw(request.body)
    team = get_team(request.user)
    recipe = get_object_or_404(filter_recipes(team=team), pk=recipe_id)

    with transaction.atomic():
        ingredient = Ingredient.objects.create(
            quantity=params.quantity,
            name=params.name,
            description=params.description,
            recipe=recipe,
            optional=params.optional is not None and params.optional,
            position=params.position,
        )
        RecipeChange.objects.create(
            recipe=recipe,
            actor=request.user,
            before="",
            after=ingredient_to_text(ingredient),
            change_type=ChangeType.INGREDIENT_CREATE,
        )
        save_recipe_version(recipe_id=recipe_id, actor=request.user)

    publish_recipe(recipe_id=recipe.id, team_id=team.id)
    return JsonResponse(serialize_ingredient(ingredient), status=201)
