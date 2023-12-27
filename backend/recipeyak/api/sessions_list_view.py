from __future__ import annotations

from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.session_delete_all_view import session_delete_all_view
from recipeyak.api.session_list_view import session_list_view


@api_view(["GET", "DELETE"])
@permission_classes([IsAuthenticated])
def sessions_list_view(request: AuthedRequest) -> Response:
    if request.method == "DELETE":
        return session_delete_all_view(request)
    elif request.method == "GET":
        return session_list_view(request)
    else:
        raise MethodNotAllowed(request.method or "")
