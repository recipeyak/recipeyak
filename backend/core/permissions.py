from rest_framework import permissions

from django.shortcuts import get_object_or_404
from django.db.models import Q


from .models import Team, Membership


class IsTeamMember(permissions.BasePermission):
    def has_permission(self, request, view) -> bool:
        team_pk = view.kwargs['team_pk']
        team = Team.objects.get(id=team_pk)
        return team.is_member(request.user)


class IsTeamMemberIfPrivate(permissions.BasePermission):
    def has_permission(self, request, view) -> bool:
        team_pk = view.kwargs['team_pk']
        team = Team.objects.get(id=team_pk)
        return team.is_member(request.user) or (team.is_public and request.user)


class CanRetrieveListMember(permissions.BasePermission):
    """
    If the team is public or the user is a member, they can view it.
    Unactive users are not considered a member.
    """
    def has_permission(self, request, view) -> bool:
        if view.action is None:
            raise AssertionError
        if view.action in ('list', 'retrieve'):
            team_pk = view.kwargs['team_pk']
            team = Team.objects.get(id=team_pk)

            is_member = team.membership_set.filter(user=request.user, is_active=True).exists()

            return team.is_public or is_member
        return True

# USE has_obj_permission and permissions.SAFE_METHODS

class IsTeamAdmin(permissions.BasePermission):
    def has_permission(self, request, view) -> bool:
        if view.basename == 'teams':
            team_pk = view.kwargs['pk']
        else:
            team_pk = view.kwargs['team_pk']
        team = Team.objects.get(id=team_pk)
        return team.membership_set \
                .filter(level=Membership.ADMIN) \
                .filter(user=request.user).exists()


class IsTeamAdminOrMembershipOwner(permissions.BasePermission):
    """
    Request is Admin the team or the membership object owner
    """
    def has_object_permission(self, request, view, membership_obj) -> bool:
        if not isinstance(membership_obj, Membership):
            raise TypeError('This permission only works for membership objects')
        object_owner = membership_obj.user == request.user
        team_admin = membership_obj.team.is_admin(request.user)
        return object_owner or team_admin


class CanDestroyMember(IsTeamAdmin):
    def has_permission(self, request, view) -> bool:
        if view.action is None:
            raise AssertionError
        if view.action in ('destroy',):
            return super().has_permission(request, view)
        return True


class DeleteIfMemberOrAdmin(IsTeamMember):
    def has_permission(self, request, view) -> bool:
        if view.action != 'destroy':
            return True
        team_pk = view.kwargs['team_pk']
        team = Team.objects.get(id=team_pk)
        return team.membership_set \
                .filter(Q(level=Membership.ADMIN) | Q(level=Membership.CONTRIBUTOR)) \
                .filter(user=request.user).exists()


# FIXME: modify permissions classes so they follow the form `Can<Action><ClassName>`
# Improve permissions classes so they check what the method the request is using
# and only apply their restriction if it matches their request
# e.g. CanDestroyMember only applies itself on the destroy action, otherwise it returns true
# check view.action

# FIXME: All of these seem to not work correctly because `view.action` can be None for some reason!


class CanUpdateMember(IsTeamAdmin):
    def has_permission(self, request, view) -> bool:
        if view.action is None:
            raise AssertionError
        if view.action in ('update', 'partial_update',):
            return super().has_permission(request, view)
        return True


class CanRetrieveTeamInvite(permissions.BasePermission):
    def has_permission(self, request, view) -> bool:
        return true

class CanListTeamInvite(permissions.BasePermission):
    def has_permission(self, request, view) -> bool:
        return true

class CanCreateTeamInvite(permissions.BasePermission):
    def has_permission(self, request, view) -> bool:
        return true

class CanDestroyTeamInvite(permissions.BasePermission):
    def has_permission(self, request, view) -> bool:
        return true
