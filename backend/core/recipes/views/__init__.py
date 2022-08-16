from __future__ import annotations

import collections
import logging
from typing import Any, Iterable, List, Optional

from django.db import transaction
from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.exceptions import MethodNotAllowed, PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core import viewsets
from core.auth.permissions import (
    HasRecipeAccess,
    IsTeamMemberIfPrivate,
    NonSafeIfMemberOrAdmin,
    has_recipe_access,
)
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
    Team,
    TimelineEvent,
    Upload,
    User,
    user_and_team_recipes,
)
from core.models.user import get_avatar_url
from core.recipes.serializers import (
    IngredientSerializer,
    RecipeMoveCopySerializer,
    RecipeSerializer,
    RecipeTimelineSerializer,
    SectionSerializer,
    StepSerializer,
    serialize_attachments,
    serialize_note,
    serialize_reactions,
)
from core.recipes.utils import add_positions
from core.request import AuthedRequest
from core.serialization import RequestParams

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

    @action(
        detail=True,
        methods=["post"],
        url_name="move",
        serializer_class=RecipeMoveCopySerializer,
        permission_classes=[IsAuthenticated, HasRecipeAccess],
    )
    def move(self, request: AuthedRequest, pk: str) -> Response:
        """
        Move recipe from user to another team.
        User should have write access to team to move recipe

        /recipes/<recipe_id>/move
            {'id':<team_id>, type:'team'}
        """
        recipe = self.get_object()
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        if serializer.validated_data["type"] == "team":
            team = Team.objects.get(id=serializer.validated_data["id"])
            if not (team.is_contributor(request.user) or team.is_admin(request.user)):
                raise PermissionDenied(detail="user must have write permissions")
            recipe.move_to(team)
        elif serializer.validated_data["type"] == "user":
            user = User.objects.get(id=serializer.validated_data["id"])
            if user != request.user:
                raise PermissionDenied(detail="user must be the same as requester")
            recipe.move_to(user)

        return Response(
            RecipeSerializer(recipe, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )

    @action(
        detail=True,
        methods=["post"],
        url_name="copy",
        serializer_class=RecipeMoveCopySerializer,
        permission_classes=[IsAuthenticated, HasRecipeAccess],
    )
    def copy(self, request: AuthedRequest, pk: str) -> Response:
        """
        Copy recipe from user to team.
        Any team member should be able to copy a recipe from the team.
        User should have write access to team to copy recipe
        """
        recipe: Recipe = self.get_object()
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        user: User = request.user

        if serializer.validated_data["type"] == "team":
            team = Team.objects.get(id=serializer.validated_data["id"])
            if not (team.is_contributor(request.user) or team.is_admin(request.user)):
                raise PermissionDenied(detail="user must have write permissions")
            new_recipe = recipe.copy_to(account=team, actor=user)
        elif serializer.validated_data["type"] == "user":
            user = User.objects.get(id=serializer.validated_data["id"])
            if user != request.user:
                raise PermissionDenied(detail="user must be the same as requester")
            new_recipe = recipe.copy_to(account=user, actor=user)

        # refetch all relations before serialization
        prefetched_recipe: Recipe = Recipe.objects.prefetch_related(
            "owner",
            "step_set",
            "ingredient_set",
            "scheduledrecipe_set",
            "notes",
            "notes__uploads",
            "notes__reactions",
            "notes__reactions__created_by",
            "timelineevent_set",
            "section_set",
        ).get(id=new_recipe.id)
        return Response(
            RecipeSerializer(prefetched_recipe).data, status=status.HTTP_200_OK
        )

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[IsAuthenticated, HasRecipeAccess],
    )
    def duplicate(self, request: AuthedRequest, pk: str) -> Response:
        user: User = request.user
        recipe: Recipe = self.get_object()
        return Response(
            RecipeSerializer(
                recipe.duplicate(actor=user), dangerously_allow_db=True
            ).data
        )


def parse_int(val: str) -> Optional[int]:
    try:
        return int(val)
    except ValueError:
        return None


@api_view(["GET"])
@permission_classes((IsAuthenticated,))
def get_recipe_timeline(request: AuthedRequest, recipe_pk: int) -> Response:
    user: User = request.user
    team = user.recipe_team

    recipe = get_object_or_404(Recipe, pk=recipe_pk)

    if not has_recipe_access(recipe=recipe, user=user):
        return Response(status=status.HTTP_403_FORBIDDEN)

    scheduled_recipes = ScheduledRecipe.objects.filter(
        (Q(team=team)) | Q(user=user)
    ).filter(recipe=recipe_pk)

    return Response(RecipeTimelineSerializer(scheduled_recipes, many=True).data)


# arbitrary value to increment the max position value for when we add a new
# section
POSITION_INCREMENT = 10


def get_next_max_pos(*, recipe: Recipe) -> float:
    cur_max: float = max(
        # need to convert to list due to some weirdness with how the soft
        # delete mixin overrides the `.values_list()` method
        list(recipe.ingredients.values_list("position", flat=True))
        + list(recipe.section_set.values_list("position", flat=True))
    )
    return cur_max + POSITION_INCREMENT


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_section_view(request: AuthedRequest, recipe_pk: int) -> Response:
    recipe = get_object_or_404(Recipe, pk=recipe_pk)
    if not has_recipe_access(recipe=recipe, user=request.user):
        return Response(status=status.HTTP_403_FORBIDDEN)

    serializer = SectionSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    RecipeChange.objects.create(
        recipe=recipe,
        actor=request.user,
        before="",
        after=serializer.validated_data["title"],
        change_type=ChangeType.SECTION_CREATE,
    )

    position = serializer.validated_data.get(
        "position", get_next_max_pos(recipe=recipe)
    )

    serializer.save(recipe=recipe, position=position)

    return Response(serializer.data, status=status.HTTP_201_CREATED)


def delete_section_view(request: AuthedRequest, section_pk: int) -> Response:
    section = get_object_or_404(Section, pk=section_pk)
    recipe = section.recipe
    if not has_recipe_access(recipe=recipe, user=request.user):
        return Response(status=status.HTTP_403_FORBIDDEN)

    RecipeChange.objects.create(
        recipe=recipe,
        actor=request.user,
        before=section.title,
        after="",
        change_type=ChangeType.SECTION_DELETE,
    )

    section.delete()

    return Response(status=status.HTTP_204_NO_CONTENT)


def update_section_view(request: AuthedRequest, section_pk: int) -> Response:
    section = get_object_or_404(Section, pk=section_pk)
    recipe = section.recipe
    if not has_recipe_access(recipe=section.recipe, user=request.user):
        return Response(status=status.HTTP_403_FORBIDDEN)

    serializer = SectionSerializer(section, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    RecipeChange.objects.create(
        recipe=recipe,
        actor=request.user,
        before=section.title,
        after=serializer.validated_data.get("title", ""),
        change_type=ChangeType.SECTION_UPDATE,
    )
    serializer.save(recipe=section.recipe)

    return Response(serializer.data)


@api_view(["PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def delete_or_update_section_view(request: AuthedRequest, section_pk: int) -> Response:
    if request.method == "PATCH":
        return update_section_view(request, section_pk)
    if request.method == "DELETE":
        return delete_section_view(request, section_pk)
    assert request.method is not None
    raise MethodNotAllowed(method=request.method)


class TeamRecipesViewSet(APIView):
    permission_classes = (
        IsAuthenticated,
        IsTeamMemberIfPrivate,
        NonSafeIfMemberOrAdmin,
    )

    def get(self, request: AuthedRequest, team_pk: str) -> Response:
        # TODO(sbdchd): combine with the normal recipe viewset and just pass an
        # extra query param for filtering
        team = get_object_or_404(Team, pk=self.kwargs["team_pk"])
        queryset = Recipe.objects.filter(owner_team=team).prefetch_related(
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
        serializer = RecipeSerializer(
            queryset, many=True, context={"request": self.request}
        )

        return Response(serializer.data, status=status.HTTP_200_OK)


class StepViewSet(viewsets.ModelViewSet):

    queryset = Step.objects.all()
    serializer_class = StepSerializer
    permission_classes = (IsAuthenticated,)

    def create(  # type: ignore [override]
        self, request: AuthedRequest, recipe_pk: str
    ) -> Response:
        """
        create the step and attach it to the correct recipe
        """
        serializer = self.serializer_class(data=request.data)
        recipe = get_object_or_404(Recipe, pk=recipe_pk)

        # set a position if not provided. We must included deleted because they
        # still take up a position.
        last_step = recipe.step_set.all_with_deleted().last()
        if serializer.initial_data.get("position") is None:
            if last_step is not None:
                serializer.initial_data["position"] = last_step.position + 10.0
            else:
                serializer.initial_data["position"] = 10.0

        if serializer.is_valid():
            serializer.save(recipe=recipe)
            logger.info("Step created by %s", request.user)
            RecipeChange.objects.create(
                recipe=recipe,
                actor=request.user,
                before="",
                after=serializer.validated_data["text"],
                change_type=ChangeType.STEP_CREATE,
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance: Step = self.get_object()
        before_text = instance.text
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        RecipeChange.objects.create(
            recipe=instance.recipe,
            actor=request.user,
            before=before_text,
            after=instance.text,
            change_type=ChangeType.STEP_UPDATE,
        )

        return Response(serializer.data)

    def perform_destroy(self, instance: Step) -> None:
        RecipeChange.objects.create(
            recipe=instance.recipe,
            actor=self.request.user,
            before=instance.text,
            after="",
            change_type=ChangeType.STEP_DELETE,
        )
        super().perform_destroy(instance)


def ingredient_to_text(ingredient: Ingredient) -> str:
    text = f"{ingredient.quantity} {ingredient.name}"

    if ingredient.description:
        text += f", {ingredient.description}"

    if ingredient.optional:
        text += " [optional]"

    return text


class IngredientViewSet(viewsets.ModelViewSet):

    queryset = Ingredient.objects.all()
    serializer_class = IngredientSerializer
    permission_classes = (IsAuthenticated,)

    def create(  # type: ignore [override]
        self, request: AuthedRequest, recipe_pk: str
    ) -> Response:
        """
        create the ingredient and attach it to the correct recipe
        """
        serializer = self.serializer_class(data=request.data)
        recipe = get_object_or_404(Recipe, pk=recipe_pk)

        # set a position if not provided. We must included deleted because they
        # still take up a position.
        last_ingredient = recipe.ingredient_set.all_with_deleted().last()
        if serializer.initial_data.get("position") is None:
            if last_ingredient is not None:
                serializer.initial_data["position"] = last_ingredient.position + 10.0
            else:
                serializer.initial_data["position"] = 10.0

        if serializer.is_valid():
            recipe = Recipe.objects.get(pk=recipe_pk)
            instance: Ingredient = serializer.save(recipe=recipe)
            logger.info("Ingredient created by %s", self.request.user)
            RecipeChange.objects.create(
                recipe=recipe,
                actor=request.user,
                before="",
                after=ingredient_to_text(instance),
                change_type=ChangeType.INGREDIENT_CREATE,
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request: AuthedRequest, *args: Any, **kwargs: Any) -> Response:
        partial = kwargs.pop("partial", False)
        instance: Ingredient = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        before = ingredient_to_text(instance)

        self.perform_update(serializer)

        after = ingredient_to_text(instance)

        RecipeChange.objects.create(
            recipe=instance.recipe,
            actor=request.user,
            before=before,
            after=after,
            change_type=ChangeType.INGREDIENT_UPDATE,
        )

        return Response(serializer.data)

    def perform_destroy(self, instance: Ingredient) -> None:
        RecipeChange.objects.create(
            recipe=instance.recipe,
            actor=self.request.user,
            before=ingredient_to_text(instance),
            after="",
            change_type=ChangeType.INGREDIENT_DELETE,
        )
        super().perform_destroy(instance)


class CreateNoteParams(RequestParams):
    text: str
    attachment_upload_ids: List[str]


class EditNoteParams(RequestParams):
    text: Optional[str] = None
    attachment_upload_ids: Optional[List[str]] = None


class NoteViewSet(viewsets.ModelViewSet):

    queryset = Note.objects.all()
    permission_classes = (IsAuthenticated,)

    def create(  # type: ignore [override]
        self, request: AuthedRequest, recipe_pk: str
    ) -> Response:
        recipe = get_object_or_404(Recipe, pk=recipe_pk)
        params = CreateNoteParams.parse_obj(request.data)

        note = Note.objects.create(
            text=params.text,
            created_by=request.user,
            last_modified_by=request.user,
            recipe=recipe,
        )
        Upload.objects.filter(
            id__in=params.attachment_upload_ids, created_by=request.user
        ).update(note=note)

        return Response(serialize_note(note), status=status.HTTP_201_CREATED)

    def update(  # type: ignore [override]
        self, request: AuthedRequest, partial: bool, pk: str
    ) -> Response:
        params = EditNoteParams.parse_obj(self.request.data)
        note = get_object_or_404(Note, pk=pk)
        note.last_modified_by = request.user
        if params.text is not None:
            note.text = params.text
        if params.attachment_upload_ids is not None:
            with transaction.atomic():
                Upload.objects.filter(note=note).update(note=None)
                Upload.objects.filter(
                    id__in=params.attachment_upload_ids, created_by=request.user
                ).update(note=note)
        note.save()

        return Response(serialize_note(note), status=status.HTTP_200_OK)
