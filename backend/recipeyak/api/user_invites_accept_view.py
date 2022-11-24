from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.user_invites_list_view import get_invites


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def user_invites_accept_view(request: AuthedRequest, pk: str) -> Response:
    invite = get_invites(request.user).get(id=pk)
    invite.accept()
    return Response({"detail": "accepted invite"}, status=status.HTTP_200_OK)
