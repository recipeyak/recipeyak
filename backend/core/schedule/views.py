import logging
from typing import List, Optional, cast

from django.core.exceptions import ValidationError
from django.db.models import QuerySet
from django.shortcuts import get_object_or_404
from rest_framework import serializers, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from core.auth.permissions import IsTeamMember
from core.cumin import combine_ingredients
from core.models import Ingredient, ScheduledRecipe, Team
from core.schedule.serializers import (
    ScheduledRecipeSerializer,
    ScheduledRecipeSerializerCreate,
)

logger = logging.getLogger(__name__)


def get_scheduled_recipes(*, request: Request, team_pk: str) -> Optional[QuerySet]:
    start = request.query_params.get("start")
    end = request.query_params.get("end")

    if team_pk in {"personal", "me"}:
        scheduled_recipes = request.user.scheduled_recipes
    else:
        team = Team.objects.filter(pk=team_pk).first()
        if team is None:
            return None
        scheduled_recipes = team.scheduled_recipes

    try:
        return cast(
            QuerySet, scheduled_recipes.filter(on__gte=start).filter(on__lte=end)
        )
    except (ValueError, ValidationError):
        return None


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsTeamMember])
def get_shopping_list_view(request: Request, team_pk: str) -> Response:
    scheduled_recipes = get_scheduled_recipes(request=request, team_pk=team_pk)
    if scheduled_recipes is None:
        return Response(status=status.HTTP_400_BAD_REQUEST)

    ingredients: List[Ingredient] = []
    for scheduled_recipe in scheduled_recipes:
        for _ in range(scheduled_recipe.count):
            ingredients += scheduled_recipe.recipe.ingredients

    ingredients = [
        Ingredient(quantity=i.quantity, name=i.name, description=i.description)
        for i in ingredients
    ]

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


# TODO(chdsbd): Merge this into the CalendarViewSet
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
