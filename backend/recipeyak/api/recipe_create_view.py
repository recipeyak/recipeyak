from __future__ import annotations

from typing import Annotated

import advocate
import requests
import structlog
from django.core.exceptions import ValidationError
from django.db import transaction
from pydantic import StringConstraints
from recipe_scrapers._exceptions import RecipeScrapersExceptions

from recipeyak import ordering
from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.exceptions import APIError
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.serialization import Params
from recipeyak.api.serializers.recipe import (
    RecipeSerializer,
    serialize_recipe,
)
from recipeyak.models import (
    Ingredient,
    Step,
    TimelineEvent,
)
from recipeyak.models.recipe import Recipe
from recipeyak.models.section import Section
from recipeyak.models.team import Team
from recipeyak.models.upload import Upload
from recipeyak.parsing import parse_ingredient
from recipeyak.scraper.scrape_recipe import ScrapeResult, scrape_recipe
from recipeyak.versioning import save_recipe_version

logger = structlog.stdlib.get_logger()


class RecipeCreateParams(Params):
    team: int
    from_url: Annotated[str, StringConstraints(strip_whitespace=True)] | None = None
    name: Annotated[str, StringConstraints(strip_whitespace=True)] | None = None


def _normalize_title(title: str | None) -> str | None:
    if title is None:
        return None
    return title.removesuffix("Recipe").removesuffix("recipe")


def _create_recipe_from_scrape(*, scrape: ScrapeResult, team: Team) -> Recipe:
    recipe = Recipe.objects.create(
        team=team,
        scrape_id=scrape.id,
        name=_normalize_title(scrape.title),
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


@endpoint()
def recipe_create_view(
    request: AuthedHttpRequest, params: RecipeCreateParams
) -> RecipeSerializer:
    log = logger.bind(user_id=request.user.id)

    # validate params
    team = Team.objects.filter(id=params.team, membership__user=request.user).first()
    if team is None:
        raise APIError(code="unknown_team", message="Unknown Team")

    scrape_result: ScrapeResult | None = None
    if params.from_url is not None:
        log = log.bind(from_url=params.from_url)
        try:
            scrape_result = scrape_recipe(url=params.from_url, user=request.user)
        except (
            advocate.exceptions.UnacceptableAddressException,
            ValidationError,
            RecipeScrapersExceptions,
        ) as e:
            log.info("invalid url")
            raise APIError(code="invalid_url", message="Invalid url.") from e
        except requests.exceptions.ConnectionError as e:
            log.info("probably connecting to url")
            raise APIError(
                code="connection_error", message="Problem connecting to url."
            ) from e

    with transaction.atomic():
        if scrape_result is not None:
            # bail out if we've already scraped that recipe
            if scrape_result.canonical_url is not None and (
                existing_recipe := Recipe.objects.filter(
                    team=team, source=scrape_result.canonical_url
                ).first()
            ):
                return serialize_recipe(existing_recipe, user=request.user)
            recipe = _create_recipe_from_scrape(scrape=scrape_result, team=team)
        else:
            recipe = Recipe.objects.create(team=team, name=params.name)
        TimelineEvent(
            action="created",
            created_by=request.user,
            recipe=recipe,
        ).save()
        # We save a version now to simplify the diff view -- no need to
        # construct a versions from both the "historical" tables and the current
        # table, instead we only look at historical, with the assumption that
        # this recipe version is the same as the one we create above in the
        # transaction
        save_recipe_version(recipe_id=recipe.id, actor=request.user)

    return serialize_recipe(recipe, user=request.user)
