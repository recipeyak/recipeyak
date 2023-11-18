from __future__ import annotations

from datetime import datetime, timedelta

import advocate
import structlog
from django.core.exceptions import ValidationError
from django.db.models import Count, Q
from django.db.models.functions import Now
from pydantic import BaseModel, Field
from recipe_scrapers._exceptions import RecipeScrapersExceptions
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
from recipeyak.models.upload import Upload
from recipeyak.scraper import scrape_recipe

logger = structlog.stdlib.get_logger()


class RecipeListItemIngredient(BaseModel):
    id: int
    quantity: str
    name: str


class RecipeListItemPrimaryImage(BaseModel):
    id: int
    url: str
    backgroundUrl: str | None = Field(...)


class RecipeListItem(BaseModel):
    id: int
    name: str
    scheduledCount: int
    # This odd syntax is required by pydantic
    # see: https://docs.pydantic.dev/usage/models/#required-optional-fields
    # Until V2 is released:
    # see: https://github.com/pydantic/pydantic/issues/4887
    # see: https://docs.pydantic.dev/blog/pydantic-v2/#required-vs-nullable-cleanup
    author: str | None = Field(...)
    tags: list[str] | None = Field(...)
    ingredients: list[RecipeListItemIngredient]
    archived_at: datetime | None = Field(...)
    primaryImage: RecipeListItemPrimaryImage | None = Field(...)


def recipe_get_view(request: AuthedRequest) -> Response:
    team = get_team(request)
    list_items = list[RecipeListItem]()
    for recipe in (
        filter_recipes(team=team)
        .annotate(
            scheduled_count=Count(
                "scheduledrecipe",
                filter=Q(
                    scheduledrecipe__on__lt=Now(),
                    scheduledrecipe__on__gt=Now() - timedelta(days=365 * 1.5),
                ),
            )
        )
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
                id=recipe.primary_image.id,
                url=recipe.primary_image.public_url(),
                backgroundUrl=recipe.primary_image.background_url,
            )
            if recipe.primary_image is not None
            else None
        )

        list_items.append(
            RecipeListItem(
                id=recipe.id,
                name=recipe.name,
                author=recipe.author,
                tags=recipe.tags,
                ingredients=ingredients,
                archived_at=recipe.archived_at,
                primaryImage=primary_image,
                scheduledCount=recipe.scheduled_count,
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
    log = logger.bind(user_id=request.user.id)
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
        log = log.bind(from_url=params.from_url)
        try:
            scrape_result = scrape_recipe(url=params.from_url, user=request.user)
        except (
            advocate.exceptions.UnacceptableAddressException,
            ValidationError,
            RecipeScrapersExceptions,
        ):
            log.info("invalid url")
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
            primary_image_id=scrape_result.upload_id,
        )
        if scrape_result.upload_id is not None:
            Upload.objects.filter(id=scrape_result.upload_id).update(
                recipe_id=recipe.id,
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
