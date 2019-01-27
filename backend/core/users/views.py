from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.utils import timezone
from user_sessions.models import Session
from django.shortcuts import get_object_or_404

from core.models import MyUser
from core.users.serializers import (
    UserSerializer as UserDetailsSerializer,
    SessionSerializer,
)


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

    def get_object(self) -> MyUser:
        return self.request.user

    def delete(self, request: Request) -> Response:
        if request.user.has_team():
            raise PermissionDenied(
                detail="you must leave all your teams to delete your account"
            )
        request.user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET", "DELETE"])
@permission_classes([IsAuthenticated])
def sessions(request: Request) -> Response:
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
def sessions_detail(request: Request, pk: str) -> Response:
    get_object_or_404(request.user.session_set, pk=pk).delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
