from __future__ import annotations

import collections
import logging
from typing import Any, Iterable

import advocate
from django.core.exceptions import ValidationError
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak import ordering
from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.base.serialization import RequestParams
from recipeyak.api.serializers.recipe import (
    IGNORED_TIMELINE_EVENTS,
    RecipeSerializer,
    serialize_attachments,
    serialize_reactions,
)
from recipeyak.cumin.quantity import parse_ingredient
from recipeyak.models import (
    Ingredient,
    Note,
    Reaction,
    ScheduledRecipe,
    Section,
    Step,
    TimelineEvent,
    Upload,
    filter_recipes,
    get_team,
)
from recipeyak.models.recipe import Recipe
from recipeyak.models.team import Team
from recipeyak.models.upload import public_url
from recipeyak.models.user import get_avatar_url
from recipeyak.scraper import scrape_recipe

logger = logging.getLogger(__name__)


def group_by_recipe_id(x: Iterable[dict[str, Any]]) -> dict[str, list[dict[str, Any]]]:
    map = collections.defaultdict(list)
    for item in x:
        map[item["recipe_id"]].append(item)
    return map


def recipe_get_view(request: AuthedRequest) -> Response:
    team = get_team(request)
    recipes = {
        x["id"]: x
        for x in filter_recipes(team=team).values(
            "id",
            "name",
            "author",
            "source",
            "time",
            "servings",
            "modified",
            "created",
            "archived_at",
            "primary_image__id",
            "primary_image__key",
            "primary_image__background_url",
            "tags",
        )
    }

    for recipe in recipes.values():
        image_id = recipe.pop("primary_image__id", None)
        image_key = recipe.pop("primary_image__key", None)
        background_url = recipe.pop("primary_image__background_url", None)
        if image_id is None or image_key is None:
            continue
        recipe["primaryImage"] = dict(
            id=str(image_id),
            url=public_url(key=image_key),
            backgroundUrl=background_url,
        )

    ingredients = group_by_recipe_id(
        Ingredient.objects.filter(recipe_id__in=recipes.keys()).values(
            "id",
            "quantity",
            "name",
            "description",
            "position",
            "recipe_id",
        )
    )

    steps = group_by_recipe_id(
        Step.objects.filter(recipe_id__in=recipes.keys()).values(
            "id",
            "text",
            "position",
            "recipe_id",
        )
    )

    sections = group_by_recipe_id(
        Section.objects.filter(recipe_id__in=recipes.keys()).values(
            "id",
            "title",
            "position",
            "recipe_id",
        )
    )

    notes = collections.defaultdict(list)
    note_map = dict()
    for note in Note.objects.filter(recipe_id__in=recipes.keys()).values(
        "id",
        "text",
        "modified",
        "created",
        "recipe_id",
        "last_modified_by",
        "last_modified_by__email",
        "last_modified_by__name",
        "created_by",
        "created_by__email",
        "created_by__name",
    ):

        for name in ("last_modified_by", "created_by"):
            if note[name] is not None:
                display_name = note.get(f"{name}__name") or note[f"{name}__email"]
                email = note[f"{name}__email"]
                note[name] = dict(
                    id=note[name],
                    email=email,
                    name=display_name,
                    avatar_url=get_avatar_url(email),
                )
            else:
                note.pop(name, None)
            note.pop(f"{name}__email", None)
            note.pop(f"{name}__name", None)
        note["type"] = "note"
        note["attachments"] = []
        note["reactions"] = []
        notes[note["recipe_id"]].append(note)
        note_map[note["id"]] = note

    for upload in Upload.objects.filter(note__recipe_id__in=recipes.keys()):
        primary_image = recipes[upload.recipe_id].get("primary_image")
        note_map[upload.note_id]["attachments"].append(
            list(
                serialize_attachments(
                    [upload],
                    primary_image_id=primary_image["id"] if primary_image else None,
                )
            )[0].dict()
        )
    for reaction in Reaction.objects.filter(note__recipe_id__in=recipes.keys()):
        note_map[reaction.note_id]["reactions"].append(
            list(serialize_reactions([reaction]))[0].dict()
        )

    timeline_events = collections.defaultdict(list)

    for event in TimelineEvent.objects.filter(recipe_id__in=recipes.keys()).values(
        "id",
        "action",
        "created",
        "created_by",
        "created_by__email",
        "recipe_id",
    ):
        if event["action"] in IGNORED_TIMELINE_EVENTS:
            continue
        if event["created_by"] is not None:
            email = event["created_by__email"]
            event["created_by"] = dict(
                id=event["created_by"],
                email=email,
                avatar_url=get_avatar_url(email),
            )
        event.pop("created_by__email", None)
        event["type"] = "recipe"
        timeline_events[event["recipe_id"]].append(event)

    for recipe_id, recipe in recipes.items():

        recipe["ingredients"] = ingredients.get(recipe_id) or []
        recipe["steps"] = steps.get(recipe_id) or []
        recipe["sections"] = sections.get(recipe_id) or []
        recipe["timelineItems"] = (notes.get(recipe_id) or []) + (
            timeline_events.get(recipe_id) or []
        )

    return Response(list(recipes.values()))


class RecipePostParams(RequestParams):
    team: str
    from_url: str | None = None
    name: str | None = None


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
        recipe = Recipe.objects.create(owner=team, name=params.name)

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
