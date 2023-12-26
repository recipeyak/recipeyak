from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.base.serialization import RequestParams
from recipeyak.api.calendar_list_get_view import get_cal_settings
from recipeyak.models import Membership, get_team


class CalSettingsSerializer(RequestParams):
    syncEnabled: bool


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_settings(request: AuthedRequest, team_pk: int = -1) -> Response:
    params = CalSettingsSerializer.parse_obj(request.data)
    sync_enabled = params.syncEnabled
    team_pk = get_team(request).id

    membership = get_object_or_404(Membership, team=team_pk, user=request.user)
    membership.calendar_sync_enabled = sync_enabled
    membership.save()

    return Response(get_cal_settings(request=request, team_pk=team_pk))
