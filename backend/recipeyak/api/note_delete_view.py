from __future__ import annotations

from rest_framework import status
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.models import filter_notes, get_team


def note_delete_view(request: AuthedRequest, note_pk: str) -> Response:
    team = get_team(request)
    filter_notes(team=team).filter(pk=note_pk, created_by=request.user).delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
