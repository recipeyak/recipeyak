from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.user_invites_list_view import get_invites


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def user_invites_decline_view(request: AuthedRequest, pk: str) -> Response:
    invite = get_object_or_404(get_invites(request.user), id=pk)
    invite.decline()
    return Response({"detail": "declined invite"}, status=status.HTTP_200_OK)
