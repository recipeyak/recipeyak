from __future__ import annotations

from datetime import date

from django.db.models import QuerySet
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from typing_extensions import TypedDict

from recipeyak.api.base.permissions import IsTeamMember
from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.base.serialization import RequestParams
from recipeyak.api.calendar_serialization import serialize_scheduled_recipe
from recipeyak.api.team_detail_view import get_teams
from recipeyak.models import Membership, ScheduledRecipe, Team, filter_recipes, get_team
from recipeyak.realtime import publish_calendar_event


class CalSettings(TypedDict):
    syncEnabled: bool
    calendarLink: str


def get_cal_settings(*, team_pk: int, request: AuthedRequest) -> CalSettings:
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


class ScheduledRecipeCreateParams(RequestParams):
    recipe: int
    on: date


def get_scheduled_recipes(team_pk: int) -> QuerySet[ScheduledRecipe]:
    team = get_object_or_404(Team, pk=team_pk)
    return ScheduledRecipe.objects.filter(team=team).select_related(
        "recipe",
        "created_by",
        "recipe__primary_image",
        "recipe__primary_image__created_by",
        "recipe__primary_image__recipe",
    )


# FIXME: Handle creation
def calendar_list_post_view(request: AuthedRequest, team_pk: int) -> Response:
    params = ScheduledRecipeCreateParams.parse_obj(request.data)

    team = get_team(request)

    recipe = get_object_or_404(filter_recipes(team=team), id=params.recipe)

    scheduled_recipe = recipe.schedule(
        on=params.on,
        user=request.user,
        team=get_object_or_404(get_teams(request.user), pk=team_pk),
    )
    res = serialize_scheduled_recipe(
        scheduled_recipe, user_id=str(request.user.id), team_id=str(team_pk)
    )

    publish_calendar_event(res, team_id=team_pk)
    return Response(
        scheduled_recipe,
        status=status.HTTP_201_CREATED,
    )


class StartEndDateSerializer(RequestParams):
    start: date
    end: date


def calendar_list_get_view(request: AuthedRequest, team_pk: int) -> Response:
    params = StartEndDateSerializer.parse_obj(request.query_params.dict())
    start = params.start
    end = params.end

    queryset = get_scheduled_recipes(team_pk).filter(on__gte=start).filter(on__lte=end)

    scheduled_recipes = [
        serialize_scheduled_recipe(
            scheduled_recipe, user_id=str(request.user.id), team_id=str(team_pk)
        )
        for scheduled_recipe in queryset
    ]

    settings = get_cal_settings(request=request, team_pk=team_pk)

    return Response({"scheduledRecipes": scheduled_recipes, "settings": settings})


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated, IsTeamMember])
def calendar_list_view(request: AuthedRequest, team_pk: int) -> Response:
    if request.method == "GET":
        return calendar_list_get_view(request, team_pk)
    elif request.method == "POST":
        return calendar_list_post_view(request, team_pk)
    raise MethodNotAllowed(request.method or "")
