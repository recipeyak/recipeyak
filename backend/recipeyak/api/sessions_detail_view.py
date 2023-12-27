from __future__ import annotations

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def sessions_detail_view(request: AuthedRequest, session_id: str) -> Response:
    get_object_or_404(request.user.session_set, pk=session_id).delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
