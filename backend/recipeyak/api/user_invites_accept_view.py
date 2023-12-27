from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.models.invite import Invite


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def user_invites_accept_view(request: AuthedRequest, pk: int) -> Response:
    invite = get_object_or_404(
        Invite.objects.filter(membership__user=request.user), id=pk
    )
    invite.accept()
    return Response({"detail": "accepted invite"}, status=status.HTTP_200_OK)
