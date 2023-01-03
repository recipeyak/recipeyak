from __future__ import annotations

import logging
from datetime import datetime

import advocate
from django.core.exceptions import ValidationError
from pydantic import BaseModel
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak import ordering
from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.base.serialization import RequestParams, StrTrimmed
from recipeyak.api.serializers.recipe import (
    RecipeSerializer,
)
from recipeyak.cumin.quantity import parse_ingredient
from recipeyak.models import (
    Ingredient,
    Step,
    TimelineEvent,
    filter_recipes,
    get_team,
)
from recipeyak.models.recipe import Recipe
from recipeyak.models.team import Team
from recipeyak.scraper import scrape_recipe

logger = logging.getLogger(__name__)


class RecipeListItemIngredient(BaseModel):
    id: int
    quantity: str
    name: str


class RecipeListItemPrimaryImage(BaseModel):
    id: int
    url: str
    backgroundUrl: str | None


class RecipeListItem(BaseModel):
    id: int
    name: str
    author: str | None
    tags: list[str] | None
    ingredients: list[RecipeListItemIngredient]
    archived_at: datetime | None
    primaryImage: RecipeListItemPrimaryImage | None


def recipe_get_view(request: AuthedRequest) -> Response:
    team = get_team(request)
    list_items = list[RecipeListItem]()
    for recipe in (
        filter_recipes(team=team)
        .prefetch_related(None)
        .prefetch_related(
            "ingredient_set",
            "primary_image",
        )
    ):
        ingredients = list[RecipeListItemIngredient]()
        for ingre in recipe.ingredient_set.all():
            ingredients.append(
                RecipeListItemIngredient(
                    id=ingre.id, quantity=ingre.quantity, name=ingre.name
                )
            )

        primary_image = (
            RecipeListItemPrimaryImage(
                id=recipe.primary_image.id, url=recipe.primary_image.public_url()
            )
            if recipe.primary_image is not None
            else None
        )

        list_items.append(
            RecipeListItem(
                id=recipe.id,
                name=recipe.name,
                tags=recipe.tags,
                ingredients=ingredients,
                archived_at=recipe.archived_at,
                primaryImage=primary_image,
            )
        )

    return Response(list_items)


class RecipePostParams(RequestParams):
    team: str
    from_url: StrTrimmed | None = None
    name: StrTrimmed | None = None


def normalize_title(title: str | None) -> str | None:
    if title is None:
        return None
    return title.removesuffix("Recipe").removesuffix("recipe")


def recipe_post_view(request: AuthedRequest) -> Response:
    params = RecipePostParams.parse_obj(request.data)

    # validate params
    team = Team.objects.filter(id=params.team, membership__user=request.user).first()
    if team is None:
        return Response(
            # TODO(sbdchd): figure out error format
            {"error": True, "message": "Unknown Team"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if params.from_url is not None:
        try:
            scrape_result = scrape_recipe(url=params.from_url)
        except (advocate.exceptions.UnacceptableAddressException, ValidationError):
            return Response(
                {"error": True, "message": "invalid url"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        recipe = Recipe.objects.create(
            team=team,
            scrape_id=scrape_result.id,
            owner=team,
            name=normalize_title(scrape_result.title),
            author=scrape_result.author,
            servings=scrape_result.yields,
            time=scrape_result.total_time,
            source=scrape_result.canonical_url,
        )

        ingredients: list[Ingredient] = []
        position = ordering.FIRST_POSITION
        for ingredient in scrape_result.ingredients:
            parsed_ingredient = parse_ingredient(ingredient)
            ingredients.append(
                Ingredient(
                    position=position,
                    recipe=recipe,
                    quantity=parsed_ingredient.quantity,
                    name=parsed_ingredient.name,
                    description=parsed_ingredient.description,
                    optional=parsed_ingredient.optional,
                )
            )
            position = ordering.position_after(position)
        Ingredient.objects.bulk_create(ingredients)

        steps: list[Step] = []
        position = ordering.FIRST_POSITION
        for step in scrape_result.instructions:
            steps.append(Step(text=step, position=position, recipe=recipe))
            position = ordering.position_after(position)
        Step.objects.bulk_create(steps)
    else:
        recipe = Recipe.objects.create(owner=team, team=team, name=params.name)

    TimelineEvent(
        action="created",
        created_by=request.user,
        recipe=recipe,
    ).save()

    return Response(
        RecipeSerializer(recipe, dangerously_allow_db=True).data,
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def recipe_list_view(request: AuthedRequest) -> Response:
    if request.method == "GET":
        return recipe_get_view(request)
    elif request.method == "POST":
        return recipe_post_view(request)
    raise MethodNotAllowed(request.method or "")
