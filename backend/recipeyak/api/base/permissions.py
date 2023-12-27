from typing import Any, cast

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


def has_recipe_access(*, user: User, recipe: Recipe) -> bool:
    recipe_owner = cast(User | Team, recipe.owner)
    return (
        cast(bool, recipe.owner == user)
        if isinstance(recipe_owner, User)
        else recipe_owner.is_member(user)
    )
