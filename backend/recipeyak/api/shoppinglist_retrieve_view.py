from datetime import date

import pydantic
from django.core.exceptions import ValidationError
from django.db.models import QuerySet

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.json import json_dumps
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.api.base.serialization import RequestParams
from recipeyak.cumin.cat import category
from recipeyak.cumin.combine import Ingredient, combine_ingredients
from recipeyak.models import Ingredient as DBIngredient
from recipeyak.models import ScheduledRecipe, ShoppingList, Team, get_team


class ShoppingListParams(RequestParams):
    start: date
    end: date


def get_scheduled_recipes(
    *, params: ShoppingListParams, team_id: int
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


@endpoint()
def shoppinglist_retrieve_view(request: AuthedHttpRequest) -> JsonResponse:
    team_id = get_team(request.user).id
    params = ShoppingListParams.parse_obj(request.GET.dict())
    scheduled_recipes = get_scheduled_recipes(params=params, team_id=team_id)
    if scheduled_recipes is None:
        return JsonResponse(status=400)

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

    ingredient_mapping = combine_ingredients(ingredients)

    for ingredient in ingredient_mapping:
        ingredient_mapping[ingredient].category = category(ingredient)

    ShoppingList.objects.create(ingredients=json_dumps(ingredient_mapping).decode())

    return JsonResponse(
        {"ingredients": ingredient_mapping, "recipes": recipes.values()},
        status=200,
    )
