from typing import cast

from recipeyak.models import Recipe, Team, User


def has_recipe_access(*, user: User, recipe: Recipe) -> bool:
    recipe_owner = cast(User | Team, recipe.owner)
    return (
        cast(bool, recipe.owner == user)
        if isinstance(recipe_owner, User)
        else recipe_owner.is_member(user)
    )
