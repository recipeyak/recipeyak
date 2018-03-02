from rest_framework import permissions

from django.shortcuts import get_object_or_404


from .models import Team


class IsTeamMember(permissions.BasePermission):
    def has_permission(self, request, view) -> bool:
        team_pk = view.kwargs['team_pk']
        team = Team.objects.get(id=team_pk)
        return team.membership_set.filter(membership=request.user).exists()

