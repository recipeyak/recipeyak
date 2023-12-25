from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.user_delete_view import user_delete_view
from recipeyak.api.user_get_view import user_get_view
from recipeyak.api.user_update_view import user_patch_view


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
        return user_patch_view(request)
    elif request.method == "DELETE":
        return user_delete_view(request)
    elif request.method == "GET":
        return user_get_view(request)
    raise MethodNotAllowed(request.method or "")
