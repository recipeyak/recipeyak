from __future__ import annotations

import pydantic
from typing_extensions import TypedDict

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.serialization import Params
from recipeyak.models import get_team
from recipeyak.models.calendar import Calendar


class ListCalendarsParams(Params): ...


class CalendarSerializer(pydantic.BaseModel):
    id: int
    name: str
    pinned: bool = False


class CalendarsListResponse(TypedDict):
    calendars: list[CalendarSerializer]


@endpoint()
def calendars_list_view(
    request: AuthedHttpRequest, params: None
) -> CalendarsListResponse:
    team_id = get_team(request.user).id

    calendars = []
    for calendar in Calendar.objects.filter(team=team_id).all():
        calendars.append(
            CalendarSerializer(
                id=calendar.id,
                name=calendar.name,
                pinned=(request.user.pinned_calendar_id == calendar.id),
            )
        )

    return {"calendars": calendars}
