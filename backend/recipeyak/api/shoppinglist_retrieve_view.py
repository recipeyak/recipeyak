from datetime import date

import pydantic
from django.core.exceptions import ValidationError
from django.db.models import QuerySet
from typing_extensions import TypedDict

from recipeyak.api.base.decimal import fmt_decimal
from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.exceptions import APIError
from recipeyak.api.base.json import json_dumps
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.serialization import Params
from recipeyak.category import category
from recipeyak.combine import Ingredient, combine_ingredients
from recipeyak.models import Ingredient as DBIngredient
from recipeyak.models import ScheduledRecipe, ShoppingList, Team, get_team
from recipeyak.parsing import Unit


class ShoppinglistRetrieveParams(Params):
    start: date
    end: date


def get_scheduled_recipes(
    *, params: ShoppinglistRetrieveParams, team_id: int
) -> QuerySet[ScheduledRecipe] | None:
    team = Team.objects.filter(pk=team_id).first()
    if team is None:
        return None
    try:
        return team.scheduledrecipe_set.filter(on__gte=params.start).filter(
            on__lte=params.end
        )
    except (ValueError, ValidationError):
        return None


class ShoppingListRecipe(pydantic.BaseModel):
    scheduledRecipeId: int
    recipeId: int
    recipeName: str


class QuantityResponse(TypedDict):
    quantity: str
    unit: Unit
    unknown_unit: str | None


class IngredientResponse(TypedDict):
    quantities: list[QuantityResponse]
    category: str | None


class ShoppinglistRetrieveResponse(TypedDict):
    ingredients: dict[str, IngredientResponse]
    recipes: list[ShoppingListRecipe]


@endpoint()
def shoppinglist_retrieve_view(
    request: AuthedHttpRequest, params: ShoppinglistRetrieveParams
) -> ShoppinglistRetrieveResponse:
    team_id = get_team(request.user).id
    scheduled_recipes = get_scheduled_recipes(params=params, team_id=team_id)
    if scheduled_recipes is None:
        raise APIError(code="invalid_params", message="Couldn't find scheduled recipes")
    recipes = dict[int, ShoppingListRecipe]()
    db_ingredients: list[DBIngredient] = []
    for scheduled_recipe in scheduled_recipes:
        db_ingredients += scheduled_recipe.recipe.ingredient_set.all()
        recipes[scheduled_recipe.recipe.id] = ShoppingListRecipe(
            scheduledRecipeId=scheduled_recipe.id,
            recipeId=scheduled_recipe.recipe.id,
            recipeName=scheduled_recipe.recipe.name,
        )

    ingredients = [
        Ingredient(quantity=i.quantity, name=i.name, description=i.description)
        for i in db_ingredients
    ]

    ingredient_mapping: dict[str, IngredientResponse] = {}
    for ingredient, quantities in combine_ingredients(ingredients).items():
        ingredient_mapping[ingredient] = {
            "quantities": [
                {
                    "quantity": fmt_decimal(q.quantity),
                    "unit": q.unit,
                    "unknown_unit": q.unknown_unit,
                }
                for q in quantities
            ],
            "category": category(ingredient),
        }

    ShoppingList.objects.create(ingredients=json_dumps(ingredient_mapping).decode())

    return {"ingredients": ingredient_mapping, "recipes": list(recipes.values())}
