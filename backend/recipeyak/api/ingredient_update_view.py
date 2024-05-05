from __future__ import annotations

from typing import Annotated, TypeAlias

from django.db import transaction
from django.shortcuts import get_object_or_404
from pydantic import Field, StringConstraints

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.serialization import Params
from recipeyak.api.serializers.recipe import (
    IngredientSerializer,
    ingredient_to_text,
    serialize_ingredient,
)
from recipeyak.models import ChangeType, RecipeChange, filter_ingredients, get_team
from recipeyak.realtime import publish_recipe
from recipeyak.versioning import save_recipe_version

StrStripped: TypeAlias = Annotated[str, StringConstraints(strip_whitespace=True)]


class IngredientUpdateParams(Params):
    quantity: Annotated[
        StrStripped | None, Field(description="The new quantity of the Ingredient.")
    ] = None
    name: Annotated[
        StrStripped | None, Field(description="The new name of the Ingredient.")
    ] = None
    description: Annotated[
        StrStripped | None, Field(description="The new description of the Ingredient.")
    ] = None
    position: Annotated[
        str | None, Field(description="The new position of the Ingredient.")
    ] = None
    optional: Annotated[
        bool | None,
        Field(description="Whether the Ingredient is required for the Recipe."),
    ] = None
    ingredient_id: Annotated[int, Field(description="Unique ID of the ingredient.")]


@endpoint()
def ingredient_update_view(
    request: AuthedHttpRequest, params: IngredientUpdateParams
) -> IngredientSerializer:
    team = get_team(request.user)
    ingredient = get_object_or_404(
        filter_ingredients(team=team), pk=params.ingredient_id
    )

    with transaction.atomic():
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
        RecipeChange.objects.create(
            recipe=ingredient.recipe,
            actor=request.user,
            before=before,
            after=ingredient_to_text(ingredient),
            change_type=ChangeType.INGREDIENT_UPDATE,
        )
        save_recipe_version(recipe_id=ingredient.recipe_id, actor=request.user)

    publish_recipe(recipe_id=ingredient.recipe_id, team_id=team.id)

    return serialize_ingredient(ingredient)
