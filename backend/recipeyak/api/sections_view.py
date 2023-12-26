from __future__ import annotations

from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.section_delete_view import section_delete_view
from recipeyak.api.section_update_view import section_update_view


@api_view(["PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def delete_or_update_section_view(request: AuthedRequest, section_pk: int) -> Response:
    if request.method == "PATCH":
        return section_update_view(request, section_pk)
    if request.method == "DELETE":
        return section_delete_view(request, section_pk)
    assert request.method is not None
    raise MethodNotAllowed(method=request.method)
