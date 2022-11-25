from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.permissions import IsTeamMember
from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.serializers.team import CreateInviteSerializer, InviteSerializer
from recipeyak.models import Team


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsTeamMember])
def team_invite_list_view(request: AuthedRequest, team_pk: str) -> Response:
    """
    for creating, we want: level, user_id
    for response, we want: id, user data, team
    We want id, user object, and team data response
    need to use to_representation or form_represenation
    """
    team = Team.objects.get(pk=team_pk)
    serializer = CreateInviteSerializer(data={**request.data, "team": team})
    serializer.is_valid(raise_exception=True)
    invite = serializer.save(team=team, creator=request.user)
    return Response(
        InviteSerializer(invite, many=True).data, status=status.HTTP_201_CREATED
    )
