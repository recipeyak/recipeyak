from django.shortcuts import get_object_or_404

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.api.base.serialization import RequestParams
from recipeyak.api.calendar_list_view import CalSettings, get_cal_settings
from recipeyak.models import Membership, get_team


class CalSettingsParams(RequestParams):
    syncEnabled: bool


@endpoint()
def calendar_update_settings_view(
    request: AuthedHttpRequest[CalSettingsParams]
) -> JsonResponse[CalSettings]:
    params = CalSettingsParams.parse_raw(request.body)
    sync_enabled = params.syncEnabled
    team_id = get_team(request.user).id

    membership = get_object_or_404(Membership, team=team_id, user=request.user)
    membership.calendar_sync_enabled = sync_enabled
    membership.save()

    return JsonResponse(get_cal_settings(request=request, team_id=team_id))
