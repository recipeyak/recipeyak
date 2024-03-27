from __future__ import annotations

from django.db import transaction
from django.shortcuts import get_object_or_404

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.serialization import Params
from recipeyak.api.serializers.recipe import ingredient_to_text
from recipeyak.models import ChangeType, RecipeChange, filter_ingredients, get_team
from recipeyak.realtime import publish_recipe
from recipeyak.versioning import save_recipe_version


class IngredientDeleteParams(Params):
    ingredient_id: int


@endpoint()
def ingredient_delete_view(
    request: AuthedHttpRequest, params: IngredientDeleteParams
) -> None:
    team = get_team(request.user)
    ingredient = get_object_or_404(
        filter_ingredients(team=team), pk=params.ingredient_id
    )
    with transaction.atomic():
        recipe_id = ingredient.recipe.id
        RecipeChange.objects.create(
            recipe=ingredient.recipe,
            actor=request.user,
            before=ingredient_to_text(ingredient),
            after="",
            change_type=ChangeType.INGREDIENT_DELETE,
        )
        filter_ingredients(team=team).filter(pk=params.ingredient_id).delete()
        save_recipe_version(recipe_id=recipe_id, actor=request.user)
    publish_recipe(recipe_id=ingredient.recipe_id, team_id=team.id)
