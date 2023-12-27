import pydantic
from django.core.exceptions import ValidationError
from django.db.models import QuerySet
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.drf_json_renderer import JSONRenderer
from recipeyak.api.base.request import AuthedRequest
from recipeyak.cumin.cat import category
from recipeyak.cumin.combine import Ingredient, combine_ingredients
from recipeyak.models import ScheduledRecipe, ShoppingList, Team, get_team


def get_scheduled_recipes(
    *, request: AuthedRequest, team_id: int
) -> QuerySet[ScheduledRecipe] | None:
    start = request.query_params.get("start")
    end = request.query_params.get("end")

    team = Team.objects.filter(pk=team_id).first()
    if team is None:
        return None
    scheduled_recipes = team.scheduled_recipes

    try:
        return scheduled_recipes.filter(on__gte=start).filter(on__lte=end)
    except (ValueError, ValidationError):
        return None


class ShoppingListRecipe(pydantic.BaseModel):
    scheduledRecipeId: int
    recipeId: int
    recipeName: str


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_shopping_list_view(request: AuthedRequest, team_id: int = -1) -> Response:
    team_id = get_team(request).id
    scheduled_recipes = get_scheduled_recipes(request=request, team_id=team_id)
    if scheduled_recipes is None:
        return Response(status=status.HTTP_400_BAD_REQUEST)

    recipes = dict[int, ShoppingListRecipe]()
    ingredients: list[Ingredient] = []
    for scheduled_recipe in scheduled_recipes:
        ingredients += scheduled_recipe.recipe.ingredients  # type: ignore [arg-type]
        recipes[scheduled_recipe.recipe.id] = ShoppingListRecipe(
            scheduledRecipeId=scheduled_recipe.id,
            recipeId=scheduled_recipe.recipe.id,
            recipeName=scheduled_recipe.recipe.name,
        )

    ingredients = [
        Ingredient(quantity=i.quantity, name=i.name, description=i.description)
        for i in ingredients
    ]

    ingredient_mapping = combine_ingredients(ingredients)

    for ingredient in ingredient_mapping:
        ingredient_mapping[ingredient].category = category(ingredient)

    ShoppingList.objects.create(
        ingredients=JSONRenderer().render(ingredient_mapping).decode()
    )

    if request.query_params.get("with_recipes") == "1":
        return Response(
            {"ingredients": ingredient_mapping, "recipes": recipes.values()},
            status=status.HTTP_200_OK,
        )

    # deprecated 2022-01-16
    return Response(ingredient_mapping, status=status.HTTP_200_OK)
