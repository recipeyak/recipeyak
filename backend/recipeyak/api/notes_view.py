from __future__ import annotations

from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.note_delete_view import note_delete_view
from recipeyak.api.note_update_view import note_update_view


@api_view(["DELETE", "PATCH"])
@permission_classes([IsAuthenticated])
def note_detail_view(request: AuthedRequest, note_pk: str) -> Response:
    if request.method == "PATCH":
        return note_update_view(request, note_pk)
    if request.method == "DELETE":
        return note_delete_view(request, note_pk)
    raise MethodNotAllowed(request.method or "")
