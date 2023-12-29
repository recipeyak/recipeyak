from recipeyak.models import Recipe, User


def has_recipe_access(*, user: User, recipe: Recipe) -> bool:
    assert recipe.team is not None, "Recipe must have a team"
    return recipe.team.is_member(user)
