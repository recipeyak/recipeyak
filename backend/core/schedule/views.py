import logging
from typing import List

from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status, views
from django.core.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import serializers

from core.models import Ingredient, ScheduledRecipe, Team

from core.auth.permissions import IsTeamMember

from .serializers import ScheduledRecipeSerializer, ScheduledRecipeSerializerCreate

from .utils import combine_ingredients

logger = logging.getLogger(__name__)


class ShoppingListView(views.APIView):

    permission_classes = (IsAuthenticated,)

    def get(self, request) -> Response:
        start = request.query_params.get("start")
        end = request.query_params.get("end")

        try:
            scheduled_recipes = request.user.scheduled_recipes.filter(
                on__gte=start
            ).filter(on__lte=end)
        except (ValueError, ValidationError):
            return Response(status=status.HTTP_400_BAD_REQUEST)

        ingredients: List[Ingredient] = []
        for scheduled_recipe in scheduled_recipes:
            for _ in range(scheduled_recipe.count):
                ingredients += scheduled_recipe.recipe.ingredients

        return Response(combine_ingredients(ingredients), status=status.HTTP_200_OK)


class TeamShoppingListViewSet(viewsets.ViewSet):

    permission_classes = (IsAuthenticated, IsTeamMember)

    def list(self, request: Request, team_pk: str) -> Response:
        start = request.query_params.get("start")
        end = request.query_params.get("end")

        team = get_object_or_404(Team, pk=team_pk)

        try:
            scheduled_recipes = team.scheduled_recipes.filter(on__gte=start).filter(
                on__lte=end
            )
        except (ValueError, ValidationError):
            return Response(status=status.HTTP_400_BAD_REQUEST)

        ingredients: List[Ingredient] = []
        for scheduled_recipe in scheduled_recipes:
            for _ in range(scheduled_recipe.count):
                ingredients += scheduled_recipe.recipe.ingredients

        return Response(combine_ingredients(ingredients), status=status.HTTP_200_OK)


class ReportBadMerge(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request: Request) -> Response:
        user = request.user
        logger.warning(
            "bad combine for user: %s with recipes: %s", user, user.scheduled_recipes
        )
        return Response(status=status.HTTP_201_CREATED)


class StartEndDateSerializer(serializers.Serializer):
    start = serializers.DateField()
    end = serializers.DateField()


class CalendarViewSet(viewsets.ModelViewSet):
    serializer_class = ScheduledRecipeSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return ScheduledRecipe.objects.filter(user=self.request.user).select_related(
            "recipe"
        )

    def create(self, request: Request) -> Response:
        # use different create serializer since we create via primary key, and
        # return an objects
        serializer = ScheduledRecipeSerializerCreate(data=request.data)
        serializer.is_valid(raise_exception=True)

        n = serializer.save(user=request.user)
        return Response(
            self.get_serializer(n, dangerously_allow_db=True).data,
            status=status.HTTP_201_CREATED,
        )

    def list(self, request: Request) -> Response:
        serializer = StartEndDateSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        start = serializer.validated_data["start"]
        end = serializer.validated_data["end"]
        queryset = self.get_queryset().filter(on__gte=start).filter(on__lte=end)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# TODO(chdsbd): Merge this into the CalendarViewSet
class TeamCalendarViewSet(viewsets.ModelViewSet):
    serializer_class = ScheduledRecipeSerializer
    permission_classes = (IsAuthenticated, IsTeamMember)

    def get_queryset(self):
        team = get_object_or_404(Team, pk=self.kwargs["team_pk"])
        return ScheduledRecipe.objects.filter(team=team).select_related("recipe")

    def create(self, request: Request, team_pk: str) -> Response:
        # use different create serializer since we create via primary key, and
        # return an objects
        serializer = ScheduledRecipeSerializerCreate(data=request.data)
        serializer.is_valid(raise_exception=True)

        team = get_object_or_404(Team, pk=team_pk)
        n = serializer.save(team=team)
        return Response(
            self.get_serializer(n, dangerously_allow_db=True).data,
            status=status.HTTP_201_CREATED,
        )

    def list(self, request: Request, team_pk: str) -> Response:
        start = request.query_params.get("start")
        end = request.query_params.get("end")

        team = get_object_or_404(Team, pk=team_pk)
        try:
            queryset = team.scheduled_recipes.filter(on__gte=start).filter(on__lte=end)
        except (ValueError, ValidationError):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
