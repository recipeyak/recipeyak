from __future__ import annotations

from collections import namedtuple
from datetime import datetime
from typing import Any, NamedTuple, cast

import advocate
import structlog
from django.core.exceptions import ValidationError
from django.db import connection, transaction
from django.db.backends.utils import CursorWrapper
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
    get_team,
)
from recipeyak.models.recipe import Recipe
from recipeyak.models.section import Section
from recipeyak.models.team import Team
from recipeyak.models.upload import Upload, public_url
from recipeyak.scraper import ScrapeResult, scrape_recipe

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


class ListQueryResult(NamedTuple):
    id: int
    name: str
    author: str
    scheduled_count: int
    archived_at: datetime | None
    tags: list[str]
    ingredients: list[dict[str, Any]]
    primary_image: dict[str, Any]


def namedtuplefetchall(cursor: CursorWrapper) -> list[ListQueryResult]:
    """
    Return all rows from a cursor as a namedtuple.
    Assume the column names are unique.
    """
    desc = cursor.description
    if desc is None:
        raise Exception("Description should exist")

    nt_result = namedtuple("Result", [col[0] for col in desc])  # type: ignore[misc]
    return cast(list[ListQueryResult], [nt_result(*row) for row in cursor.fetchall()])


def recipe_get_view(request: AuthedRequest) -> Response:
    team = get_team(request)
    list_items = list[RecipeListItem]()
    with connection.cursor() as cursor:
        cursor.execute(
            """
select
    core_recipe.id,
	core_recipe.name,
	core_recipe.author,
	(
		select count(*)
		from core_scheduledrecipe
		where core_scheduledrecipe.on > (now() - '1.5 years'::interval)
			and core_scheduledrecipe.on < now()
		    and core_scheduledrecipe.recipe_id = core_recipe.id
    ) scheduled_count,
    core_recipe.tags,
    core_recipe.archived_at, 
    (
		select json_agg(sub.ingredient) ingredients
		from (
			select json_build_object(
                'id', id,
                'quantity', quantity,
                'name', name
            ) ingredient
			from core_ingredient
			where recipe_id = core_recipe.id
        ) sub
    ) ingredients,
    (
        select
            json_build_object(
                'id', id,
                'key', key,
                'background_url', background_url
            ) primary_image
        from
            core_upload
        where core_upload.recipe_id = core_recipe.id
            and core_upload.id = core_recipe.primary_image_id
        limit 1
    ) primary_image
from core_recipe
where core_recipe.team_id = %(team_id)s
            """,
            {
                "team_id": team.id,
            },
        )
        recipes = namedtuplefetchall(cursor)
    for recipe in recipes:
        ingredients = list[RecipeListItemIngredient]()
        for ingre in recipe.ingredients:
            ingredients.append(
                RecipeListItemIngredient(
                    id=ingre["id"], quantity=ingre["quantity"], name=ingre["name"]
                )
            )

        primary_image = (
            RecipeListItemPrimaryImage(
                id=recipe.primary_image["id"],
                url=public_url(recipe.primary_image["key"]),
                backgroundUrl=recipe.primary_image["background_url"],
            )
            if recipe.primary_image
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

    ingredients: list[Ingredient] = []
    sections: list[Section] = []
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

    steps: list[Step] = []
    position = ordering.FIRST_POSITION
    for step in scrape.instructions:
        steps.append(Step(text=step, position=position, recipe=recipe))
        position = ordering.position_after(position)
    Step.objects.bulk_create(steps)

    return recipe


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
                status=status.HTTP_400_BAD_REQUEST,
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
