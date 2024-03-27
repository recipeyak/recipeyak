from __future__ import annotations

from django.shortcuts import get_object_or_404
from typing_extensions import TypedDict

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.models import Membership, get_team


class CalendarSettingsSerializer(TypedDict):
    syncEnabled: bool
    calendarLink: str


def get_cal_settings(
    *,
    team_id: int,
    request: AuthedHttpRequest,
) -> CalendarSettingsSerializer:
    membership = get_object_or_404(Membership, team=team_id, user=request.user)
    calendar_link = f"webcal://{request.get_host()}/t/{team_id}/ical/{membership.calendar_secret_key}/schedule.ics"
    return {
        "syncEnabled": membership.calendar_sync_enabled,
        "calendarLink": calendar_link,
    }


@endpoint()
def calendar_settings_retrieve_view(
    request: AuthedHttpRequest, params: None
) -> CalendarSettingsSerializer:
    team_id = get_team(request.user).id
    return get_cal_settings(request=request, team_id=team_id)
