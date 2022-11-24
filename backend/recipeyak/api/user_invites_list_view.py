from django.db.models import QuerySet

from recipeyak.models import Invite, User
from rest_framework.response import Response
from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.serializers.team import InviteSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated


def get_invites(user: User) -> QuerySet[Invite]:
    return (
        Invite.objects.filter(membership__user=user)
        .select_related("membership", "creator")
        .prefetch_related("membership__user", "membership__team")
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_invites_list_view(request: AuthedRequest) -> Response:
    queryset = get_invites(request.user)
    serializer = InviteSerializer(queryset, many=True)
    return Response(serializer.data)
