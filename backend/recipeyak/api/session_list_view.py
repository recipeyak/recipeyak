from __future__ import annotations

from datetime import datetime
from typing import Literal

import pydantic
from django.utils import timezone
from rest_framework.response import Response

from recipeyak import user_agent
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


def session_list_view(request: AuthedRequest) -> Response:
    query_set = request.user.session_set

    qs = query_set.filter(expire_date__gt=timezone.now()).order_by("-last_activity")

    sessions = list[SessionResponse]()
    for s in qs:
        assert s.user_agent is not None
        ua = user_agent.parse(s.user_agent)
        sessions.append(
            SessionResponse(
                id=s.session_key,
                device=DeviceResponse(kind=ua.kind, os=ua.os, browser=ua.browser),
                last_activity=s.last_activity,
                ip=s.ip,
                current=s.session_key == request.session.session_key,
            )
        )

    return Response(sessions)
