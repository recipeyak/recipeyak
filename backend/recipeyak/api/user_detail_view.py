from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.serializers.user import UserSerializer as UserDetailsSerializer


def user_detail_delete_view(request: AuthedRequest) -> Response:
    # TODO: probably disable login and then logout user
    request.user.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


def user_detail_get_view(request: AuthedRequest) -> Response:
    serializer = UserDetailsSerializer(request.user)
    return Response(serializer.data)


def user_detail_patch_view(request: AuthedRequest) -> Response:
    serializer = UserDetailsSerializer(request.user, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def user_detail_view(request: AuthedRequest) -> Response:
    """
    Reads and updates UserModel fields
    Accepts GET, PUT, PATCH methods.

    Default accepted fields: username, first_name, last_name
    Default display fields: pk, username, email, first_name, last_name
    Read-only fields: pk, email

    Returns UserModel fields.
    """
    if request.method == "PATCH":
        return user_detail_patch_view(request)
    elif request.method == "DELETE":
        return user_detail_delete_view(request)
    elif request.method == "GET":
        return user_detail_get_view(request)
    raise MethodNotAllowed(request.method or "")
