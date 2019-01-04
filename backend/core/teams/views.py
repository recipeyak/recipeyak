from typing import Tuple, Any

from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status, mixins
from rest_framework.decorators import detail_route
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.permissions import IsAuthenticated, SAFE_METHODS

from core.auth.permissions import (
    IsTeamMember,
    IsTeamAdmin,
    IsTeamAdminOrMembershipOwner,
)

from core.models import Team, Invite

from .serializers import (
    TeamSerializer,
    MembershipSerializer,
    InviteSerializer,
    CreateInviteSerializer,
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

    def create(self, request: Request, team_pk: str) -> Response:
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


class UserInvitesViewSet(
    viewsets.GenericViewSet, mixins.RetrieveModelMixin, mixins.ListModelMixin
):
    """
    Personal route that lists all of a users invites via `/invites`

    Retrieve - return specific invite for user
    List - return all invites user

    Detail routes
    `invites/<id>/accept` - post to accept invite
    `invites/<id>/decline` - post to decline invite
    """

    serializer_class = InviteSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return (
            Invite.objects.filter(membership__user=self.request.user)
            .select_related("membership", "creator")
            .prefetch_related("membership__user", "membership__team")
        )

    @detail_route(methods=["post"], url_name="accept")
    def accept(self, request: Request, pk: str) -> Response:
        invite = self.get_object()
        invite.accept()
        return Response({"detail": "accepted invite"}, status=status.HTTP_200_OK)

    @detail_route(methods=["post"])
    def decline(self, request: Request, pk: str) -> Response:
        invite = self.get_object()
        invite.decline()
        return Response({"detail": "declined invite"}, status=status.HTTP_200_OK)


class TeamViewSet(viewsets.ModelViewSet):
    """
    Team viewset for /t/<team>

    Retrieve - Anyone if public, otherwise only members
    List - Anyone if public, otherwise only members
    Destroy - Only TeamAdmins can destroy
    Update - Only TeamAdmins can update
    """

    serializer_class = TeamSerializer

    def get_queryset(self):
        return Team.objects.filter(
            membership__user_id=self.request.user.id
        ) | Team.objects.filter(is_public=True)

    def get_permissions(self):
        permission_classes: Tuple[Any, ...]
        if self.action in ("retrieve", "list", "create"):
            permission_classes = (IsAuthenticated,)
        else:
            permission_classes = (IsAuthenticated, IsTeamAdmin)
        return [permission() for permission in permission_classes]

    def create(self, request):
        serializer = self.serializer_class(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        team = serializer.save()
        team.force_join_admin(request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class MembershipViewSet(
    viewsets.GenericViewSet,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    mixins.DestroyModelMixin,
    mixins.UpdateModelMixin,
):
    """
    Member viewset for /t/<team>/members

    Retrieve - Only TeamMembers can list all members
    List - Only TeamMembers can list all members
    Destroy - TeamAdmins and specific member can destroy members
    Update - Only TeamAdmins can update members
    """

    serializer_class = MembershipSerializer

    def get_queryset(self):
        team = get_object_or_404(Team.objects.all(), pk=self.kwargs["team_pk"])
        return team.membership_set.select_related("user").all()

    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            permission_classes = (IsAuthenticated, IsTeamMember)
        elif self.request.method == "DELETE":
            permission_classes = (IsAuthenticated, IsTeamAdminOrMembershipOwner)
        else:
            permission_classes = (IsAuthenticated, IsTeamAdmin)
        return [permission() for permission in permission_classes]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            instance.delete()
        except ValueError as e:
            return Response(str(e), status=status.HTTP_400_BAD_REQUEST)
        return Response(status=status.HTTP_204_NO_CONTENT)
