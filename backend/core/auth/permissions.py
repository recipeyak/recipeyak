from typing import Union, cast

from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import permissions

from core.models import Membership, MyUser, Recipe, Team


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


class IsTeamMemberIfPrivate(permissions.BasePermission):
    def has_permission(self, request, view) -> bool:
        team_pk = view.kwargs["team_pk"]
        team: Team = get_object_or_404(Team, pk=team_pk)
        return team.is_member(request.user) or (team.is_public and request.user)


class IsTeamAdmin(permissions.BasePermission):
    def has_permission(self, request, view) -> bool:
        if view.basename == "teams":
            team_pk = view.kwargs["pk"]
        else:
            team_pk = view.kwargs["team_pk"]
        team = get_object_or_404(Team, pk=team_pk)
        return cast(
            bool,
            (
                team.membership_set.filter(level=Membership.ADMIN)
                .filter(user=request.user)
                .exists()
            ),
        )


class IsTeamAdminOrMembershipOwner(permissions.BasePermission):
    """
    Request is Admin the team or the membership object owner
    """

    def has_object_permission(self, request, view, membership: Membership) -> bool:
        if not isinstance(membership, Membership):
            raise TypeError("This permission only works for membership objects")
        object_owner = membership.user == request.user
        team_admin = membership.team.is_admin(request.user)
        return cast(bool, (object_owner or team_admin))


class NonSafeIfMemberOrAdmin(IsTeamMember):
    def has_permission(self, request, view) -> bool:
        if request.method in permissions.SAFE_METHODS:
            return True
        team_pk = view.kwargs["team_pk"]
        team = get_object_or_404(Team, pk=team_pk)
        return cast(
            bool,
            (
                team.membership_set.filter(
                    Q(level=Membership.ADMIN) | Q(level=Membership.CONTRIBUTOR)
                )
                .filter(user=request.user)
                .exists()
            ),
        )


def has_recipe_access(*, user: MyUser, recipe: Recipe) -> bool:
    recipe_owner = cast(Union[MyUser, Team], recipe.owner)
    return (
        cast(bool, recipe.owner == user)
        if isinstance(recipe_owner, MyUser)
        else recipe_owner.is_member(user)
    )


class HasRecipeAccess(permissions.BasePermission):
    """
    User is recipe owner or is a member of team with Recipe
    """

    def has_object_permission(self, request, view, recipe: Recipe) -> bool:
        return has_recipe_access(user=request.user, recipe=recipe)
