from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def user_delete_view(request: AuthedRequest) -> Response:
    # TODO: probably disable login and then logout user
    request.user.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
