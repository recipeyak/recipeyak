import logging
from typing import Optional

from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from core.auth.permissions import (
    HasRecipeAccess,
    IsTeamMemberIfPrivate,
    NonSafeIfMemberOrAdmin,
    has_recipe_access,
)
from core.models import (
    ChangeType,
    Ingredient,
    MyUser,
    Note,
    Recipe,
    RecipeChange,
    ScheduledRecipe,
    Step,
    Team,
    user_and_team_recipes,
)
from core.recipes.serializers import (
    IngredientSerializer,
    NoteSerializer,
    RecipeMoveCopySerializer,
    RecipeSerializer,
    RecipeTimelineSerializer,
    StepSerializer,
)
from core.recipes.utils import add_positions

logger = logging.getLogger(__name__)


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
        recipes = user_and_team_recipes(self.request.user).prefetch_related(
            "owner",
            "step_set",
            "ingredient_set",
            "scheduledrecipe_set",
            "note_set",
            "note_set__created_by",
            "note_set__last_modified_by",
        )

        # filtering for homepage
        if self.request.query_params.get("recent") is not None:
            return recipes.order_by("-modified")[:3]

        return recipes

    def create(self, request):
        serializer = self.get_serializer(data=request.data)

        # If the client doesn't set the position on one of the objects we need
        # to renumber them all.
        serializer.initial_data["steps"] = add_positions(
            serializer.initial_data["steps"]
        )
        serializer.initial_data["ingredients"] = add_positions(
            serializer.initial_data["ingredients"]
        )

        serializer.is_valid(raise_exception=True)

        serializer.save()

        logger.info("Recipe created by %s", self.request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance: Step = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

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
                RecipeChange.objects.create(
                    actor=request.user,
                    before=getattr(instance, field) or "",
                    after=serializer.validated_data[field],
                    change_type=change_type,
                )

        self.perform_update(serializer)

        return Response(serializer.data)

    @action(
        detail=True,
        methods=["post"],
        url_name="move",
        serializer_class=RecipeMoveCopySerializer,
        permission_classes=[IsAuthenticated, HasRecipeAccess],
    )
    def move(self, request: Request, pk: str) -> Response:
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
            user = MyUser.objects.get(id=serializer.validated_data["id"])
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
    def copy(self, request: Request, pk: str) -> Response:
        """
        Copy recipe from user to team.
        Any team member should be able to copy a recipe from the team.
        User should have write access to team to copy recipe
        """
        recipe: Recipe = self.get_object()
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        user: MyUser = request.user

        if serializer.validated_data["type"] == "team":
            team = Team.objects.get(id=serializer.validated_data["id"])
            if not (team.is_contributor(request.user) or team.is_admin(request.user)):
                raise PermissionDenied(detail="user must have write permissions")
            new_recipe = recipe.copy_to(account=team, actor=user)
        elif serializer.validated_data["type"] == "user":
            user = MyUser.objects.get(id=serializer.validated_data["id"])
            if user != request.user:
                raise PermissionDenied(detail="user must be the same as requester")
            new_recipe = recipe.copy_to(account=user, actor=user)

        # refetch all relations before serialization
        prefetched_recipe: Recipe = Recipe.objects.prefetch_related(
            "owner", "step_set", "ingredient_set", "scheduledrecipe_set", "note_set"
        ).get(id=new_recipe.id)
        return Response(
            RecipeSerializer(prefetched_recipe).data, status=status.HTTP_200_OK
        )

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[IsAuthenticated, HasRecipeAccess],
    )
    def duplicate(self, request: Request, pk: str) -> Response:
        user: MyUser = request.user
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
def get_recipe_timeline(request: Request, recipe_pk: int) -> Response:
    user: MyUser = request.user
    team = user.selected_team

    recipe = get_object_or_404(Recipe, pk=recipe_pk)

    if not has_recipe_access(recipe=recipe, user=user):
        return Response(status=status.HTTP_403_FORBIDDEN)

    scheduled_recipes = ScheduledRecipe.objects.filter(
        (Q(team=team)) | Q(user=user)
    ).filter(recipe=recipe_pk)

    return Response(RecipeTimelineSerializer(scheduled_recipes, many=True).data)


class TeamRecipesViewSet(APIView):
    permission_classes = (
        IsAuthenticated,
        IsTeamMemberIfPrivate,
        NonSafeIfMemberOrAdmin,
    )

    def get(self, request: Request, team_pk: str) -> Response:
        # TODO(sbdchd): combine with the normal recipe viewset and just pass an
        # extra query param for filtering
        team = get_object_or_404(Team, pk=self.kwargs["team_pk"])
        queryset = Recipe.objects.filter(owner_team=team).prefetch_related(
            "owner", "step_set", "ingredient_set", "scheduledrecipe_set"
        )
        serializer = RecipeSerializer(
            queryset, many=True, context={"request": self.request}
        )

        return Response(serializer.data, status=status.HTTP_200_OK)


class StepViewSet(viewsets.ModelViewSet):

    queryset = Step.objects.all()
    serializer_class = StepSerializer
    permission_classes = (IsAuthenticated,)

    def create(self, request: Request, recipe_pk: str) -> Response:
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
            actor=request.user,
            before=before_text,
            after=instance.text,
            change_type=ChangeType.STEP_UPDATE,
        )

        return Response(serializer.data)

    def perform_destroy(self, instance: Step) -> None:
        RecipeChange.objects.create(
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

    def create(self, request: Request, recipe_pk: str) -> Response:
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
                actor=request.user,
                before="",
                after=ingredient_to_text(instance),
                change_type=ChangeType.INGREDIENT_CREATE,
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance: Step = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        before = ingredient_to_text(instance)

        self.perform_update(serializer)

        after = ingredient_to_text(instance)

        RecipeChange.objects.create(
            actor=request.user,
            before=before,
            after=after,
            change_type=ChangeType.INGREDIENT_UPDATE,
        )

        return Response(serializer.data)

    def perform_destroy(self, instance: Ingredient) -> None:
        RecipeChange.objects.create(
            actor=self.request.user,
            before=ingredient_to_text(instance),
            after="",
            change_type=ChangeType.INGREDIENT_DELETE,
        )
        super().perform_destroy(instance)


class NoteViewSet(viewsets.ModelViewSet):

    queryset = Note.objects.all()
    serializer_class = NoteSerializer
    permission_classes = (IsAuthenticated,)

    def create(self, request: Request, recipe_pk: str) -> Response:
        serializer = self.serializer_class(data=request.data)
        recipe = get_object_or_404(Recipe, pk=recipe_pk)
        serializer.is_valid(raise_exception=True)
        serializer.save(recipe=recipe, created_by=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def perform_update(self, serializer):
        serializer.save(last_modified_by=self.request.user)
