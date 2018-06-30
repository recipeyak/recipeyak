import logging
from typing import List

from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status, views
from django.core.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from core.models import (
    Ingredient,
    ScheduledRecipe,
    Team,
)

from core.auth.permissions import (
    IsTeamMember
)

from .serializers import (
    ScheduledRecipeSerializer,
    ScheduledRecipeSerializerCreate,
)

from .utils import combine_ingredients

logger = logging.getLogger(__name__)


class ShoppingListView(views.APIView):

    permission_classes = (IsAuthenticated,)

    def get(self, request) -> Response:
        start = request.query_params.get('start')
        end = request.query_params.get('end')

        try:
            scheduled_recipes = (request.user.scheduled_recipes
                                 .filter(on__gte=start)
                                 .filter(on__lte=end))
        except (ValueError, ValidationError):
            return Response(status=status.HTTP_400_BAD_REQUEST)

        ingredients: List[Ingredient] = []
        for scheduled_recipe in scheduled_recipes:
            for _ in range(scheduled_recipe.count):
                ingredients += scheduled_recipe.recipe.ingredients

        return Response(combine_ingredients(ingredients), status=status.HTTP_200_OK)


class TeamShoppingListViewSet(viewsets.ViewSet):

    permission_classes = (IsAuthenticated, IsTeamMember, )

    def list(self, request, team_pk=None) -> Response:
        start = request.query_params.get('start')
        end = request.query_params.get('end')

        team = get_object_or_404(Team, pk=team_pk)

        try:
            scheduled_recipes = (team.scheduled_recipes
                                 .filter(on__gte=start)
                                 .filter(on__lte=end))
        except (ValueError, ValidationError):
            return Response(status=status.HTTP_400_BAD_REQUEST)

        ingredients: List[Ingredient] = []
        for scheduled_recipe in scheduled_recipes:
            for _ in range(scheduled_recipe.count):
                ingredients += scheduled_recipe.recipe.ingredients

        return Response(combine_ingredients(ingredients), status=status.HTTP_200_OK)


class ReportBadMerge(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, format=None):
        user = request.user
        logger.warn(f'bad combine for user: {user} with recipes: {user.scheduled_recipes}')
        return Response(status=status.HTTP_201_CREATED)


class CalendarViewSet(viewsets.ModelViewSet):
    serializer_class = ScheduledRecipeSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return (ScheduledRecipe.objects
                .filter(user=self.request.user))

    def create(self, request):
        # use different create serializer since we create via primary key, and
        # return an objects
        serializer = ScheduledRecipeSerializerCreate(data=request.data)
        serializer.is_valid(raise_exception=True)

        n = serializer.save(user=request.user)
        return Response(self.get_serializer(n).data, status=status.HTTP_201_CREATED)

    def list(self, request):
        start = request.query_params.get('start')
        end = request.query_params.get('end')
        try:
            queryset = (self.get_queryset()
                            .filter(on__gte=start)
                            .filter(on__lte=end))
        except (ValueError, ValidationError):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        serializer = self.get_serializer(queryset,
                                         many=True,)
        return Response(serializer.data, status=status.HTTP_200_OK)


class TeamCalendarViewSet(viewsets.ModelViewSet):
    serializer_class = ScheduledRecipeSerializer
    permission_classes = (IsAuthenticated, IsTeamMember,)

    def get_queryset(self):
        team = get_object_or_404(Team, pk=self.kwargs['team_pk'])
        return (ScheduledRecipe.objects
                .filter(team=team))

    def create(self, request, team_pk=None):
        # use different create serializer since we create via primary key, and
        # return an objects
        serializer = ScheduledRecipeSerializerCreate(data=request.data)
        serializer.is_valid(raise_exception=True)

        team = get_object_or_404(Team, pk=team_pk)
        n = serializer.save(team=team)
        return Response(self.get_serializer(n).data, status=status.HTTP_201_CREATED)

    def list(self, request, team_pk=None):
        start = request.query_params.get('start')
        end = request.query_params.get('end')

        team = get_object_or_404(Team, pk=team_pk)
        try:
            queryset = (team.scheduled_recipes
                            .filter(on__gte=start)
                            .filter(on__lte=end))
        except (ValueError, ValidationError):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        serializer = self.get_serializer(queryset,
                                         many=True,)
        return Response(serializer.data, status=status.HTTP_200_OK)
