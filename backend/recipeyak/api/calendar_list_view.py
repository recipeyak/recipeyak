from __future__ import annotations

from datetime import date
from typing import Any

from django.db.models import QuerySet
from typing_extensions import TypedDict

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.api.base.serialization import RequestParams
from recipeyak.api.calendar_serialization import (
    ScheduleRecipeSerializer,
    serialize_scheduled_recipe,
)
from recipeyak.models import Membership, ScheduledRecipe, get_team


class CalSettings(TypedDict):
    syncEnabled: bool
    calendarLink: str


def get_cal_settings(
    *,
    team_id: int,
    request: AuthedHttpRequest[Any],
) -> CalSettings:
    membership = Membership.objects.get(team=team_id, user=request.user)

    method = "https" if request.is_secure() else "http"
    calendar_link = (
        method
        + "://"
        + request.get_host()
        + f"/t/{team_id}/ical/{membership.calendar_secret_key}/schedule.ics"
    )
    return {
        "syncEnabled": membership.calendar_sync_enabled,
        "calendarLink": calendar_link,
    }


def get_scheduled_recipes(team_id: int) -> QuerySet[ScheduledRecipe]:
    return ScheduledRecipe.objects.filter(team_id=team_id).select_related(
        "recipe",
        "created_by",
        "recipe__primary_image",
        "recipe__primary_image__created_by",
        "recipe__primary_image__created_by__profile_upload",
        "recipe__primary_image__recipe",
        "created_by__profile_upload",
    )


class StartEndDateParams(RequestParams):
    start: date
    end: date


class CalendarListResponse(TypedDict):
    scheduledRecipes: list[ScheduleRecipeSerializer]
    settings: CalSettings


@endpoint()
def calendar_list_view(
    request: AuthedHttpRequest[StartEndDateParams]
) -> JsonResponse[CalendarListResponse]:
    params = StartEndDateParams.parse_obj(request.GET.dict())
    start = params.start
    end = params.end
    team_id = get_team(request.user).id

    queryset = get_scheduled_recipes(team_id).filter(on__gte=start).filter(on__lte=end)

    scheduled_recipes = [
        serialize_scheduled_recipe(
            scheduled_recipe, user_id=(request.user.id), team_id=(team_id)
        )
        for scheduled_recipe in queryset
    ]

    settings = get_cal_settings(request=request, team_id=team_id)

    # TODO: split this into two endpoints
    return JsonResponse({"scheduledRecipes": scheduled_recipes, "settings": settings})
