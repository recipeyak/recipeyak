from django.shortcuts import get_object_or_404
from rest_framework import permissions

from core.models import Team


class DisallowAny:
    """
    want to disallow access by default, then explicitly open endpoints
    """

    def has_permission(self, request, view):
        return False

    def has_object_permission(self, request, view, obj):
        return False


class IsTeamMember(permissions.BasePermission):
    def has_permission(self, request, view) -> bool:
        team_pk = view.kwargs["team_pk"]
        if team_pk == "me":
            return True
        team: Team = get_object_or_404(Team, pk=team_pk)
        return team.is_member(request.user)
