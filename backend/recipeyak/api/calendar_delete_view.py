from __future__ import annotations

import pydantic

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.serialization import Params


class CalendarDeleteResponse(pydantic.BaseModel):
    id: int
    name: str


class CalendarDeleteParams(Params):
    calendar_id: int


@endpoint()
def calendar_delete_view(
    request: AuthedHttpRequest, params: CalendarDeleteParams
) -> CalendarDeleteResponse:
    return CalendarDeleteResponse(id=123, name=params.name)
