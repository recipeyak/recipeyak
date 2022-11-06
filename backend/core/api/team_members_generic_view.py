from typing import Any, Tuple

from django.shortcuts import get_object_or_404
from rest_framework import mixins, status, viewsets
from rest_framework.permissions import SAFE_METHODS, IsAuthenticated
from rest_framework.response import Response

from core.api.base.permissions import (
    IsTeamAdmin,
    IsTeamAdminOrMembershipOwner,
    IsTeamMember,
)
from core.api.serializers.team import MembershipSerializer
from core.models import Team


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
        permission_classes: Tuple[Any, ...]
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
