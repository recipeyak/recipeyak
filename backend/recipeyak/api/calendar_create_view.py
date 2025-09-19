from __future__ import annotations

import pydantic

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.serialization import Params
from recipeyak.models import get_team
from recipeyak.models.calendar import Calendar


class CalendarCreateResponse(pydantic.BaseModel):
    id: int
    name: str


class CalendarCreateParams(Params):
    name: str


@endpoint()
def calendar_create_view(
    request: AuthedHttpRequest, params: CalendarCreateParams
) -> CalendarCreateResponse:
    team = get_team(request.user)
    calendar = Calendar(name=params.name, team=team)
    calendar.save()
    return CalendarCreateResponse(id=calendar.id, name=calendar.name)
