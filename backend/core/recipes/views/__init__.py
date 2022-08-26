from __future__ import annotations

import collections
import logging
from typing import Any, Iterable

from django.db import connection
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core import viewsets
from core.models import (
    ChangeType,
    Ingredient,
    Note,
    Reaction,
    Recipe,
    RecipeChange,
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


class RecipeViewSet(viewsets.ModelViewSet):

    serializer_class = RecipeSerializer
    permission_classes = (IsAuthenticated,)

    def get_serializer_context(self):
        return {"request": self.request}

    def get_queryset(self):
        """
        Return recipes user owns or has access to via a team

        We restrict access via this queryset filtering.
        """
        # get all recipes user has access to
        return user_and_team_recipes(self.request.user).prefetch_related(
            "owner",
            "step_set",
            "ingredient_set",
            "scheduledrecipe_set",
            "notes",
            "notes__created_by",
            "notes__last_modified_by",
            "notes__uploads",
            "notes__reactions",
            "notes__reactions__created_by",
            "timelineevent_set",
            "timelineevent_set__created_by",
            "section_set",
        )

    def retrieve(self, request: AuthedRequest, *args: Any, **kwargs: Any) -> Response:
        instance: Recipe = self.get_object()
        serializer = self.get_serializer(instance)
        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO recipe_view (recipe_id, user_id, last_visited_at, count, created, modified)
                VALUES (%(recipe_id)s, %(user_id)s, now(), 1, now(), now())
                ON CONFLICT
                ON CONSTRAINT one_user_view_row_per_recipe
                DO UPDATE SET
                    last_visited_at =
                        CASE WHEN recipe_view.last_visited_at < now() - '1 hour'::interval THEN
                            now()
                        ELSE
                            recipe_view.last_visited_at
                        END,
                    count =
                        CASE WHEN recipe_view.last_visited_at < now() - '1 hour'::interval THEN
                            recipe_view.count + 1
                        ELSE
                            recipe_view.count
                        END
                """,
                {"user_id": request.user.id, "recipe_id": instance.id},
            )
        return Response(serializer.data)

    def list(self, request: AuthedRequest) -> Response:  # type: ignore [override]
        recipes = {
            x["id"]: x
            for x in user_and_team_recipes(self.request.user).values(
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

    def create(self, request: AuthedRequest) -> Response:  # type: ignore [override]
        serializer = self.get_serializer(data=request.data, dangerously_allow_db=True)

        # If the client doesn't set the position on one of the objects we need
        # to renumber them all.
        serializer.initial_data["steps"] = add_positions(
            serializer.initial_data["steps"]
        )
        serializer.initial_data["ingredients"] = add_positions(
            serializer.initial_data["ingredients"]
        )

        serializer.is_valid(raise_exception=True)

        new_recipe = serializer.save()

        TimelineEvent(
            action="created",
            created_by=request.user,
            recipe=new_recipe,
        ).save()

        logger.info("Recipe created by %s", self.request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance: Recipe = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        changes = []
        fields = [
            ("name", ChangeType.NAME),
            ("author", ChangeType.AUTHOR),
            ("source", ChangeType.SOURCE),
            ("servings", ChangeType.SERVINGS),
            ("time", ChangeType.TIME),
        ]
        for field, change_type in fields:
            if (
                field in serializer.validated_data
                and getattr(instance, field) != serializer.validated_data[field]
            ):
                changes.append(
                    RecipeChange(
                        recipe=instance,
                        actor=request.user,
                        before=getattr(instance, field) or "",
                        after=serializer.validated_data[field],
                        change_type=change_type,
                    )
                )

        RecipeChange.objects.bulk_create(changes)

        if (
            "archived_at" in serializer.validated_data
            and getattr(instance, "archived_at")
            != serializer.validated_data["archived_at"]
        ):
            TimelineEvent(
                action=(
                    "archived"
                    if serializer.validated_data["archived_at"]
                    else "unarchived"
                ),
                created_by=request.user,
                recipe=instance,
            ).save()

        self.perform_update(serializer)
        serializer = self.get_serializer(self.get_object())

        return Response(serializer.data)
