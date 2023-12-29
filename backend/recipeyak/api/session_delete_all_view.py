from __future__ import annotations

from datetime import datetime
from typing import Literal

import pydantic

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse


class DeviceResponse(pydantic.BaseModel):
    kind: Literal["mobile", "desktop"] | None
    os: str | None
    browser: str | None


class SessionResponse(pydantic.BaseModel):
    id: str
    device: DeviceResponse
    last_activity: datetime
    ip: str | None
    current: bool


@endpoint()
def session_delete_all_view(request: AuthedHttpRequest) -> JsonResponse:
    request.user.session_set.exclude(pk=request.session.session_key).delete()
    return JsonResponse(status=204)
