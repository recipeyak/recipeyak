from __future__ import annotations

import pydantic

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.serialization import Params
from recipeyak.models import get_team
from recipeyak.models.calendar import Calendar


class CalendarPinCreateResponse(pydantic.BaseModel):
    id: int
    name: str


class CalendarPinCreateParams(Params):
    calendar_id: int


@endpoint()
def calendar_pin_create_view(
    request: AuthedHttpRequest, params: CalendarPinCreateParams
) -> None:
    team = get_team(request.user)
    calendar = Calendar.objects.filter(team=team).get(id=params.calendar_id)
    request.user.pinned_calendar = calendar
    request.user.save(update_fields=["pinned_calendar_id"])
