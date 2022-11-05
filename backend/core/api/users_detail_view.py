from typing import cast

from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.api.serializers.user import UserSerializer as UserDetailsSerializer
from core.models import User
from core.request import AuthedRequest


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
