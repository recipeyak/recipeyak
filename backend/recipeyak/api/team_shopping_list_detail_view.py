from typing import List, Optional, cast

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from django.core.exceptions import ValidationError
from django.db.models import QuerySet
from recipeyak.api.base.drf_json_renderer import JSONRenderer
from recipeyak.api.base.permissions import IsTeamMember
from recipeyak.api.base.request import AuthedRequest
from recipeyak.cumin.cat import category
from recipeyak.cumin.combine import Ingredient, combine_ingredients
from recipeyak.models import ScheduledRecipe, ShoppingList, Team


def get_scheduled_recipes(
    *, request: AuthedRequest, team_pk: str
) -> Optional[QuerySet[ScheduledRecipe]]:
    start = request.query_params.get("start")
    end = request.query_params.get("end")

    if team_pk in {"personal", "me"}:
        scheduled_recipes = cast(
            QuerySet[ScheduledRecipe], request.user.scheduled_recipes
        )
    else:
        team = Team.objects.filter(pk=team_pk).first()
        if team is None:
            return None
        scheduled_recipes = team.scheduled_recipes

    try:
        return scheduled_recipes.filter(on__gte=start).filter(on__lte=end)
    except (ValueError, ValidationError):
        return None


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsTeamMember])
def get_shopping_list_view(request: AuthedRequest, team_pk: str) -> Response:
    scheduled_recipes = get_scheduled_recipes(request=request, team_pk=team_pk)
    if scheduled_recipes is None:
        return Response(status=status.HTTP_400_BAD_REQUEST)

    ingredients: List[Ingredient] = []
    for scheduled_recipe in scheduled_recipes:
        for _ in range(scheduled_recipe.count):
            ingredients += (
                scheduled_recipe.recipe.ingredients  # type: ignore [arg-type]
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

    return Response(ingredient_mapping, status=status.HTTP_200_OK)
