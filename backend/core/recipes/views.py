import logging

from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status, mixins
from rest_framework.decorators import detail_route
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .search import search_recipe_queryset


from core.auth.permissions import (
    IsTeamMemberIfPrivate,
    NonSafeIfMemberOrAdmin,
    HasRecipeAccess,
)

from core.models import Recipe, Step, Ingredient, Team, MyUser

from .serializers import (
    RecipeSerializer,
    StepSerializer,
    IngredientSerializer,
    RecipeMoveCopySerializer,
)

from .utils import add_positions
from core.models import user_and_team_recipes

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
        SEARCH_LIMIT = 10
        # get all recipes user has access to
        recipes = user_and_team_recipes(self.request.user)

        # filtering for homepage
        if self.request.query_params.get("recent") is not None:
            return recipes.order_by("-modified")[:3]

        query = self.request.query_params.get("q")
        if query is not None:
            return search_recipe_queryset(recipes, query, limit=SEARCH_LIMIT)

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

        logger.info(f"Recipe created by {self.request.user}")
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @detail_route(
        methods=["post"],
        url_name="move",
        serializer_class=RecipeMoveCopySerializer,
        permission_classes=[HasRecipeAccess],
    )
    def move(self, request, pk=None):
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

    @detail_route(
        methods=["post"],
        url_name="copy",
        serializer_class=RecipeMoveCopySerializer,
        permission_classes=[HasRecipeAccess],
    )
    def copy(self, request, pk=None):
        """
        Copy recipe from user to team.
        Any team member should be able to copy a recipe from the team.
        User should have write access to team to copy recipe
        """
        recipe = self.get_object()
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        if serializer.validated_data["type"] == "team":
            team = Team.objects.get(id=serializer.validated_data["id"])
            if not (team.is_contributor(request.user) or team.is_admin(request.user)):
                raise PermissionDenied(detail="user must have write permissions")
            new_recipe = recipe.copy_to(team)
        elif serializer.validated_data["type"] == "user":
            user = MyUser.objects.get(id=serializer.validated_data["id"])
            if user != request.user:
                raise PermissionDenied(detail="user must be the same as requester")
            new_recipe = recipe.copy_to(user)

        return Response(
            RecipeSerializer(new_recipe, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )


class TeamRecipesViewSet(
    viewsets.GenericViewSet,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin,
    mixins.UpdateModelMixin,
):

    serializer_class = RecipeSerializer
    permission_classes = (
        IsAuthenticated,
        IsTeamMemberIfPrivate,
        NonSafeIfMemberOrAdmin,
    )

    def get_serializer_context(self):
        return {"request": self.request}

    def get_queryset(self):
        team = get_object_or_404(Team, pk=self.kwargs["team_pk"])
        return Recipe.objects.filter(owner_team=team)

    def list(self, request, team_pk=None):
        serializer = self.get_serializer(
            self.get_queryset(),
            many=True,
            fields=("id", "name", "author", "tags", "owner"),
        )
        return Response(serializer.data, status=status.HTTP_200_OK)

    def create(self, request, team_pk=None):
        team = get_object_or_404(Team.objects.all(), pk=team_pk)

        serializer = self.get_serializer(data=request.data)
        serializer.initial_data["steps"] = add_positions(
            serializer.initial_data["steps"]
        )
        serializer.initial_data["ingredients"] = add_positions(
            serializer.initial_data["ingredients"]
        )

        serializer.is_valid(raise_exception=True)

        serializer.save(team=team)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class StepViewSet(viewsets.ModelViewSet):

    queryset = Step.objects.all()
    serializer_class = StepSerializer
    permission_classes = (IsAuthenticated,)

    def create(self, request, recipe_pk=None):
        """
        create the step and attach it to the correct recipe
        """
        serializer = self.serializer_class(data=request.data)
        recipe = get_object_or_404(Recipe, pk=recipe_pk)

        # set a position if not provided
        last_step = recipe.steps.last()
        if serializer.initial_data.get("position") is None:
            if last_step is not None:
                serializer.initial_data["position"] = last_step.position + 10.0
            else:
                serializer.initial_data["position"] = 10.0

        if serializer.is_valid():
            serializer.save(recipe=recipe)
            logger.info(f"Step created by {self.request.user}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class IngredientViewSet(viewsets.ModelViewSet):

    queryset = Ingredient.objects.all()
    serializer_class = IngredientSerializer
    permission_classes = (IsAuthenticated,)

    def create(self, request, recipe_pk=None):
        """
        create the ingredient and attach it to the correct recipe
        """
        serializer = self.serializer_class(data=request.data)
        recipe = get_object_or_404(Recipe, pk=recipe_pk)

        # set a position if not provided
        last_ingredient = recipe.ingredients.last()
        if serializer.initial_data.get("position") is None:
            if last_ingredient is not None:
                serializer.initial_data["position"] = last_ingredient.position + 10.0
            else:
                serializer.initial_data["position"] = 10.0

        if serializer.is_valid():
            recipe = Recipe.objects.get(pk=recipe_pk)
            serializer.save(recipe=recipe)
            logger.info(f"Ingredient created by {self.request.user}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
