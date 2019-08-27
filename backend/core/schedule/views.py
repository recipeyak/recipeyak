import logging
from typing import List

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.core.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from rest_framework import serializers, status, views, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from core.auth.permissions import IsTeamMember
from core.models import Ingredient, ScheduledRecipe, Team

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
    permission_classes = (IsAuthenticated, IsTeamMember)

    def get_queryset(self):
        pk = self.kwargs["team_pk"]
        if pk == "me":
            return ScheduledRecipe.objects.filter(
                user=self.request.user
            ).select_related("recipe")
        team = get_object_or_404(Team, pk=pk)
        return ScheduledRecipe.objects.filter(team=team).select_related("recipe")

    def create(self, request: Request, team_pk: str) -> Response:
        # use different create serializer since we create via primary key, and
        # return an objects
        serializer = ScheduledRecipeSerializerCreate(data=request.data)
        serializer.is_valid(raise_exception=True)

        if team_pk == "me":
            data = serializer.save(user=request.user)
        else:
            team = get_object_or_404(Team, pk=team_pk)
            data = serializer.save(team=team)
        return Response(
            self.get_serializer(data, dangerously_allow_db=True).data,
            status=status.HTTP_201_CREATED,
        )

    def list(self, request: Request, team_pk: str) -> Response:
        serializer = StartEndDateSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        start = serializer.validated_data["start"]
        end = serializer.validated_data["end"]

        queryset = self.get_queryset().filter(on__gte=start).filter(on__lte=end)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["post"])
    def presence(self, request: Request, team_pk: str) -> Response:
        # TODO(sbdchd): need to rate limit this so we don't send a message
        # every time, but then we need to send a message to the schedule page
        # team at least every 10 seconds, but not more
        # at most once every 5 seconds / user
        user = request.user

        channel_layer = get_channel_layer()

        group_name = f"schedule_presence.{team_pk}"

        async_to_sync(channel_layer.group_send)(
            group_name,
            dict(
                type="broadcast_message",
                team_id=int(team_pk),
                user=dict(id=user.id, avatar_url=user.avatar_url, email=user.email),
            ),
        )

        return Response()
