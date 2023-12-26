from __future__ import annotations

from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.permissions import IsTeamMember
from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.calendar_delete_view import calendar_delete_view
from recipeyak.api.calendar_update_view import calendar_update_view


@api_view(["PATCH", "DELETE"])
@permission_classes([IsAuthenticated, IsTeamMember])
def calendar_detail_view(request: AuthedRequest, team_pk: int, pk: int) -> Response:
    if request.method == "PATCH":
        return calendar_update_view(request, team_pk, pk)
    elif request.method == "DELETE":
        return calendar_delete_view(request, team_pk, pk)
    raise MethodNotAllowed(request.method or "")
