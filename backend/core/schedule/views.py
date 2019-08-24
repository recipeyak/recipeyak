from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from core.auth.permissions import IsTeamMember


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsTeamMember])
def presence(request: Request, team_pk: str) -> Response:
    user = request.user

    channel_layer = get_channel_layer()

    group_name = f"schedule_presence.{team_pk}"

    async_to_sync(channel_layer.group_send)(
        group_name,
        dict(
            type="broadcast_message",
            team_id=int(team_pk),
            user=dict(id=user.id, avatar_url=user.avatar_url, email=user.email),
        ),
    )

    return Response()
