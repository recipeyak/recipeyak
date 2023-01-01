from typing import Any, Union, cast

from django.shortcuts import get_object_or_404
from rest_framework import permissions
from rest_framework.request import Request

from recipeyak.models import Recipe, Team, User


class DisallowAny:
    """
    want to disallow access by default, then explicitly open endpoints
    """

    def has_permission(self, request: Request, view: Any) -> bool:
        return False

    def has_object_permission(self, request: Request, view: Any, obj: Any) -> bool:
        return False


class IsTeamMember(permissions.BasePermission):
    def has_permission(self, request: Any, view: Any) -> bool:
        team_pk = view.kwargs["team_pk"]
        team: Team = get_object_or_404(Team, pk=team_pk)
        return team.is_member(request.user)


def has_recipe_access(*, user: User, recipe: Recipe) -> bool:
    recipe_owner = cast(Union[User, Team], recipe.owner)
    return (
        cast(bool, recipe.owner == user)
        if isinstance(recipe_owner, User)
        else recipe_owner.is_member(user)
    )
