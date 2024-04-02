from django.shortcuts import get_object_or_404

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.calendar_settings_retrieve_view import (
    CalendarSettingsSerializer,
    get_cal_settings,
)
from recipeyak.models import Membership, get_random_ical_id, get_team


@endpoint()
def calendar_generate_link_view(
    request: AuthedHttpRequest, params: None
) -> CalendarSettingsSerializer:
    team_id = get_team(request.user).id
    membership = get_object_or_404(Membership, team=team_id, user=request.user)
    membership.calendar_secret_key = get_random_ical_id()
    membership.save()

    return get_cal_settings(request=request, team_id=team_id)
