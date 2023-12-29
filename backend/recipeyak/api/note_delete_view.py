from __future__ import annotations

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.models import filter_notes, get_team


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def note_delete_view(request: AuthedRequest, note_id: str) -> Response:
    team = get_team(request.user)
    filter_notes(team=team).filter(pk=note_id, created_by=request.user).delete()
    return Response(status=204)
