from rest_framework import mixins, status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from core.api.base.permissions import (
    IsTeamMember,
)

from core.models import Invite, Team
from core.teams.serializers import (
    CreateInviteSerializer,
    InviteSerializer,
)


class TeamInviteViewSet(
    viewsets.GenericViewSet, mixins.CreateModelMixin, mixins.DestroyModelMixin
):
    """
    Invite viewset for /t/<team-name>/invites

    Retrieve - return specific invite for the team
    List - return all invites for the team
    Create - create new invite
    Destroy - remove existing invite
    """

    serializer_class = InviteSerializer
    permission_classes = (IsAuthenticated, IsTeamMember)

    def get_queryset(self):
        team_pk = self.kwargs["team_pk"]
        return Invite.objects.filter(membership__team__id=team_pk)

    def create(  # type: ignore [override]
        self, request: Request, team_pk: str
    ) -> Response:
        """
        for creating, we want: level, user_id
        for response, we want: id, user data, team
        We want id, user object, and team data response
        need to use to_representation or form_represenation
        """
        team = Team.objects.get(pk=team_pk)
        serializer = CreateInviteSerializer(data={**request.data, "team": team})
        serializer.is_valid(raise_exception=True)
        invite = serializer.save(team=team, creator=self.request.user)
        return Response(
            InviteSerializer(invite, many=True).data, status=status.HTTP_201_CREATED
        )
