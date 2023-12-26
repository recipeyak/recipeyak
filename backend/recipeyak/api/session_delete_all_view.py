from __future__ import annotations

from datetime import datetime
from typing import Literal

import pydantic
from rest_framework import status
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest


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


def session_delete_all_view(request: AuthedRequest) -> Response:
    request.user.session_set.exclude(pk=request.session.session_key).delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
