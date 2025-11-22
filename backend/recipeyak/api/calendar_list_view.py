from __future__ import annotations

from datetime import date

from django.db.models import QuerySet
from typing_extensions import TypedDict

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.serialization import Params
from recipeyak.api.calendar_serialization import (
    ScheduleRecipeSerializer,
    serialize_scheduled_recipe,
)
from recipeyak.models import ScheduledRecipe, get_pinned_calendar, get_team


def get_scheduled_recipes(team_id: int, calendar_id: int) -> QuerySet[ScheduledRecipe]:
    return ScheduledRecipe.objects.filter(
        team_id=team_id, calendar_id=calendar_id
    ).select_related(
        "recipe",
        "created_by",
        "recipe__primary_image",
        "recipe__primary_image__created_by",
        "recipe__primary_image__created_by__profile_upload",
        "recipe__primary_image__recipe",
        "created_by__profile_upload",
    )


class CalendarListParams(Params):
    start: date
    end: date


class CalendarListResponse(TypedDict):
    scheduledRecipes: list[ScheduleRecipeSerializer]


@endpoint()
def calendar_list_view(
    request: AuthedHttpRequest, params: CalendarListParams
) -> CalendarListResponse:
    start = params.start
    end = params.end
    team_id = get_team(request.user).id
    calendar_id = get_pinned_calendar(request.user, team_id).id

    queryset = (
        get_scheduled_recipes(team_id, calendar_id)
        .filter(on__gte=start)
        .filter(on__lte=end)
    )

    scheduled_recipes = [
        serialize_scheduled_recipe(
            scheduled_recipe, user_id=(request.user.id), team_id=(team_id)
        )
        for scheduled_recipe in queryset
    ]

    return {"scheduledRecipes": scheduled_recipes}
