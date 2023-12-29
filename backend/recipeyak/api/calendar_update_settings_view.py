from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.base.serialization import RequestParams
from recipeyak.api.calendar_list_view import get_cal_settings
from recipeyak.models import Membership, get_team


class CalSettingsSerializer(RequestParams):
    syncEnabled: bool


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def calendar_update_settings_view(
    request: AuthedRequest, team_id: int = -1
) -> Response:
    params = CalSettingsSerializer.parse_obj(request.data)
    sync_enabled = params.syncEnabled
    team_id = get_team(request.user).id

    membership = get_object_or_404(Membership, team=team_id, user=request.user)
    membership.calendar_sync_enabled = sync_enabled
    membership.save()

    return Response(get_cal_settings(request=request, team_id=team_id))
