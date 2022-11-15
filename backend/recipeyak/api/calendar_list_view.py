from __future__ import annotations

from datetime import date

from rest_framework import serializers, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from typing_extensions import TypedDict

from django.db.models import QuerySet
from django.shortcuts import get_object_or_404
from recipeyak.api.base.permissions import IsTeamMember
from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.base.serialization import BaseModelSerializer, RequestParams
from recipeyak.api.serializers.recipe import RecipeSerializer
from recipeyak.models import Membership, ScheduledRecipe, Team


class CalSettings(TypedDict):
    syncEnabled: bool
    calendarLink: str


def get_cal_settings(*, team_pk: str, request: AuthedRequest) -> CalSettings:
    membership = Membership.objects.get(team=team_pk, user=request.user)

    method = "https" if request.is_secure() else "http"
    calendar_link = (
        method
        + "://"
        + request.get_host()
        + f"/t/{team_pk}/ical/{membership.calendar_secret_key}/schedule.ics"
    )
    return {
        "syncEnabled": membership.calendar_sync_enabled,
        "calendarLink": calendar_link,
    }


class ScheduledRecipeSerializerCreate(BaseModelSerializer):
    class Meta:
        model = ScheduledRecipe
        fields = ("id", "recipe", "created", "on", "count")

    def create(self, validated_data):
        recipe = validated_data.pop("recipe")
        return recipe.schedule(**validated_data, user=self.context["request"].user)


def get_scheduled_recipes(
    request: AuthedRequest, team_pk: str
) -> QuerySet[ScheduledRecipe]:
    pk = team_pk
    if pk == "me":
        return ScheduledRecipe.objects.filter(user=request.user).select_related(
            "recipe", "created_by"
        )
    team = get_object_or_404(Team, pk=pk)
    return ScheduledRecipe.objects.filter(team=team).select_related(
        "recipe", "created_by"
    )


class ScheduledRecipeSerializer(BaseModelSerializer):
    recipe = RecipeSerializer(fields=("id", "name"))
    createdBy = serializers.SerializerMethodField()

    class Meta:
        model = ScheduledRecipe
        fields = ("id", "recipe", "created", "on", "count", "team", "user", "createdBy")

    def get_createdBy(self, obj: ScheduledRecipe) -> dict[str, str | None] | None:
        if obj.created_by is None:
            return None
        return {
            "id": obj.created_by.id,
            "name": obj.created_by.name,
            "avatar_url": obj.created_by.avatar_url,
        }


def calendar_list_post_view(request: AuthedRequest, team_pk: str) -> Response:
    # use different create serializer since we create via primary key, and
    # return an objects
    serializer = ScheduledRecipeSerializerCreate(
        data=request.data, context={"request": request}
    )
    serializer.is_valid(raise_exception=True)

    if team_pk == "me":
        data = serializer.save(user=request.user)
    else:
        team = get_object_or_404(Team, pk=team_pk)
        data = serializer.save(team=team)
    return Response(
        ScheduledRecipeSerializer(data, dangerously_allow_db=True).data,
        status=status.HTTP_201_CREATED,
    )


class StartEndDateSerializer(RequestParams):
    start: date
    end: date


def calendar_list_get_view(request: AuthedRequest, team_pk: str) -> Response:
    params = StartEndDateSerializer.parse_obj(request.query_params.dict())
    start = params.start
    end = params.end

    queryset = (
        get_scheduled_recipes(request, team_pk)
        .filter(on__gte=start)
        .filter(on__lte=end)
    )

    scheduled_recipes = ScheduledRecipeSerializer(
        queryset, many=True, context={"created_by"}
    ).data

    if "v2" in request.query_params:
        # HACK(sbdchd): we don't support the calendar stuff for personal
        # schedules due to us storing info on the team membership.
        if team_pk == "me":
            return Response(
                {
                    "scheduledRecipes": scheduled_recipes,
                    "settings": {"syncEnabled": False, "calendarLink": ""},
                }
            )

        settings = get_cal_settings(request=request, team_pk=team_pk)

        return Response({"scheduledRecipes": scheduled_recipes, "settings": settings})

    return Response(scheduled_recipes, status=status.HTTP_200_OK)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated, IsTeamMember])
def calendar_list_view(request: AuthedRequest, team_pk: str) -> Response:
    if request.method == "GET":
        return calendar_list_get_view(request, team_pk)
    elif request.method == "POST":
        return calendar_list_post_view(request, team_pk)
    raise MethodNotAllowed(request.method or "")
