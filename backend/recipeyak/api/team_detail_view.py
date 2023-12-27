from __future__ import annotations

from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.team_delete_view import team_delete_view
from recipeyak.api.team_get_view import team_get_view
from recipeyak.api.team_update_view import team_update_view


@api_view(["DELETE", "PATCH", "GET"])
@permission_classes([IsAuthenticated])
def team_detail_view(request: AuthedRequest, team_pk: int) -> Response:
    if request.method == "PATCH":
        return team_update_view(request, team_pk)
    elif request.method == "GET":
        return team_get_view(request, team_pk)
    elif request.method == "DELETE":
        return team_delete_view(request, team_pk)
    else:
        raise MethodNotAllowed(request.method or "")
