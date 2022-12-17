from __future__ import annotations

from django.contrib.auth import logout
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_user_detail_view(request: Request) -> Response:
    """
    Calls Django logout method and logs out current User object.

    Accepts/Returns nothing.
    """
    logout(request)

    return Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)
