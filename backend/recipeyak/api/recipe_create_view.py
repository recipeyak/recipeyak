from __future__ import annotations

import advocate
import structlog
from django.core.exceptions import ValidationError
from django.db import transaction
from recipe_scrapers._exceptions import RecipeScrapersExceptions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak import ordering
from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.base.serialization import RequestParams, StrTrimmed
from recipeyak.api.serializers.recipe import (
    serialize_recipe,
)
from recipeyak.cumin.quantity import parse_ingredient
from recipeyak.models import (
    Ingredient,
    Step,
    TimelineEvent,
)
from recipeyak.models.recipe import Recipe
from recipeyak.models.section import Section
from recipeyak.models.team import Team
from recipeyak.models.upload import Upload
from recipeyak.scraper import ScrapeResult, scrape_recipe

logger = structlog.stdlib.get_logger()


class RecipePostParams(RequestParams):
    team: str
    from_url: StrTrimmed | None = None
    name: StrTrimmed | None = None


def normalize_title(title: str | None) -> str | None:
    if title is None:
        return None
    return title.removesuffix("Recipe").removesuffix("recipe")


def create_recipe_from_scrape(*, scrape: ScrapeResult, team: Team) -> Recipe:
    recipe = Recipe.objects.create(
        team=team,
        scrape_id=scrape.id,
        owner=team,
        name=normalize_title(scrape.title),
        author=scrape.author,
        servings=scrape.yields,
        time=scrape.total_time,
        source=scrape.canonical_url,
        primary_image_id=scrape.upload_id,
    )
    if scrape.upload_id is not None:
        Upload.objects.filter(id=scrape.upload_id).update(
            recipe_id=recipe.id,
        )

    ingredients = list[Ingredient]()
    sections = list[Section]()
    position = ordering.FIRST_POSITION
    for group in scrape.ingredient_groups:
        if group.name is not None:
            sections.append(Section(position=position, recipe=recipe, title=group.name))
            position = ordering.position_after(position)
        for ingredient in group.ingredients:
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
    Section.objects.bulk_create(sections)

    steps = list[Step]()
    position = ordering.FIRST_POSITION
    for step in scrape.instructions:
        steps.append(Step(text=step, position=position, recipe=recipe))
        position = ordering.position_after(position)
    Step.objects.bulk_create(steps)

    return recipe


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def recipe_create_view(request: AuthedRequest) -> Response:
    log = logger.bind(user_id=request.user.id)
    params = RecipePostParams.parse_obj(request.data)

    # validate params
    team = Team.objects.filter(id=params.team, membership__user=request.user).first()
    if team is None:
        return Response(
            # TODO(sbdchd): figure out error format
            {"error": True, "message": "Unknown Team"},
            status=400,
        )

    scrape_result: ScrapeResult | None = None
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
                status=400,
            )

    with transaction.atomic():
        if scrape_result is not None:
            recipe = create_recipe_from_scrape(scrape=scrape_result, team=team)
        else:
            recipe = Recipe.objects.create(owner=team, team=team, name=params.name)
        TimelineEvent(
            action="created",
            created_by=request.user,
            recipe=recipe,
        ).save()

    return Response(
        serialize_recipe(recipe=recipe),
        status=201,
    )
