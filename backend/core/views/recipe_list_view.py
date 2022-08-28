from __future__ import annotations

import collections
import logging
from typing import Any, Iterable, Optional

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from core.serialization import RequestParams

from core.models import (
    Ingredient,
    Note,
    Reaction,
    ScheduledRecipe,
    Section,
    Step,
    TimelineEvent,
    Upload,
    user_and_team_recipes,
)
from core.models.user import get_avatar_url
from core.recipes.serializers import (
    RecipeSerializer,
    serialize_attachments,
    serialize_reactions,
)
from core.recipes.utils import add_positions
from core.request import AuthedRequest

logger = logging.getLogger(__name__)


def group_by_recipe_id(x: Iterable[dict[str, Any]]) -> dict[str, list[dict[str, Any]]]:
    map = collections.defaultdict(list)
    for item in x:
        map[item["recipe_id"]].append(item)
    return map


def recipe_get_view(request: AuthedRequest) -> Response:
    recipes = {
        x["id"]: x
        for x in user_and_team_recipes(request.user).values(
            "id",
            "name",
            "author",
            "source",
            "time",
            "servings",
            "edits",
            "modified",
            "owner_team",
            "owner_team__name",
            "owner_user",
            "created",
            "archived_at",
            "tags",
        )
    }

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

    schedule_recipe = dict()
    for schedule in (
        ScheduledRecipe.objects.filter(recipe_id__in=recipes.keys())
        .distinct("recipe_id")
        .order_by("-recipe_id", "-on")
        .values("recipe_id", "on")
    ):
        schedule_recipe[schedule["recipe_id"]] = schedule["on"]

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
        note_map[upload.note_id]["attachments"].append(
            list(serialize_attachments([upload]))[0].dict()
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
        if recipe["owner_team"]:
            recipe["owner"] = dict(
                type="team",
                id=recipe["owner_team"],
                name=recipe["owner_team__name"],
            )
        else:
            recipe["owner"] = dict(type="user", id=recipe["owner_team"])

        recipe.pop("owner_user", None)
        recipe.pop("owner_user", None)
        recipe.pop("owner_team__name", None)

        recipe["last_scheduled_at"] = schedule_recipe.get(recipe_id)

        recipe["ingredients"] = ingredients.get(recipe_id) or []
        recipe["steps"] = steps.get(recipe_id) or []
        recipe["sections"] = sections.get(recipe_id) or []
        recipe["timelineItems"] = (notes.get(recipe_id) or []) + (
            timeline_events.get(recipe_id) or []
        )

    return Response(list(recipes.values()))


def recipe_post_view(request: AuthedRequest) -> Response:
    serializer = RecipeSerializer(
        data=request.data, dangerously_allow_db=True, context={"request": request}
    )

    # If the client doesn't set the position on one of the objects we need
    # to renumber them all.
    serializer.initial_data["steps"] = add_positions(
        serializer.initial_data.get("steps", [])
    )
    serializer.initial_data["ingredients"] = add_positions(
        serializer.initial_data.get("ingredients", [])
    )

    serializer.is_valid(raise_exception=True)

    new_recipe = serializer.save()

    TimelineEvent(
        action="created",
        created_by=request.user,
        recipe=new_recipe,
    ).save()

    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def recipe_list_view(request: AuthedRequest) -> Response:
    if request.method == "GET":
        return recipe_get_view(request)
    elif request.method == "POST":
        return recipe_post_view(request)
    raise MethodNotAllowed(request.method or "")
