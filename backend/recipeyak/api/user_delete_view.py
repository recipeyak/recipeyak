from rest_framework import status
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest


def user_delete_view(request: AuthedRequest) -> Response:
    # TODO: probably disable login and then logout user
    request.user.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
