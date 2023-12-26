from __future__ import annotations

from datetime import date

from django.db.models import QuerySet
from rest_framework.response import Response
from typing_extensions import TypedDict

from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.base.serialization import RequestParams
from recipeyak.api.calendar_serialization import serialize_scheduled_recipe
from recipeyak.models import Membership, ScheduledRecipe, Team, get_team


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


def get_scheduled_recipes(team_pk: int) -> QuerySet[ScheduledRecipe]:
    return ScheduledRecipe.objects.filter(team_id=team_pk).select_related(
        "recipe",
        "created_by",
        "recipe__primary_image",
        "recipe__primary_image__created_by",
        "recipe__primary_image__recipe",
    )


class StartEndDateSerializer(RequestParams):
    start: date
    end: date


def calendar_list_get_view(request: AuthedRequest) -> Response:
    params = StartEndDateSerializer.parse_obj(request.query_params.dict())
    start = params.start
    end = params.end
    team_pk = get_team(request).id

    queryset = get_scheduled_recipes(team_pk).filter(on__gte=start).filter(on__lte=end)

    scheduled_recipes = [
        serialize_scheduled_recipe(
            scheduled_recipe, user_id=(request.user.id), team_id=(team_pk)
        )
        for scheduled_recipe in queryset
    ]

    settings = get_cal_settings(request=request, team_pk=team_pk)

    return Response({"scheduledRecipes": scheduled_recipes, "settings": settings})
