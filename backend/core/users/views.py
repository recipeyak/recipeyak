from typing import cast

from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.models import User
from core.request import AuthedRequest
from core.users.serializers import SessionSerializer
from core.users.serializers import UserSerializer as UserDetailsSerializer


class UserDetailsView(RetrieveUpdateAPIView):
    """
    Reads and updates UserModel fields
    Accepts GET, PUT, PATCH methods.

    Default accepted fields: username, first_name, last_name
    Default display fields: pk, username, email, first_name, last_name
    Read-only fields: pk, email

    Returns UserModel fields.
    """

    serializer_class = UserDetailsSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self) -> User:
        return cast(User, self.request.user)

    def delete(self, request: AuthedRequest) -> Response:
        if request.user.has_team():
            raise PermissionDenied(
                detail="you must leave all your teams to delete your account"
            )
        request.user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET", "DELETE"])
@permission_classes([IsAuthenticated])
def sessions(request: AuthedRequest) -> Response:
    query_set = request.user.session_set

    if request.method == "DELETE":
        query_set.exclude(pk=request.session.session_key).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    qs = query_set.filter(expire_date__gt=timezone.now()).order_by("-last_activity")

    return Response(
        SessionSerializer(
            qs, many=True, context=dict(request=request), dangerously_allow_db=True
        ).data
    )


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def sessions_detail(request: AuthedRequest, pk: str) -> Response:
    get_object_or_404(request.user.session_set, pk=pk).delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
