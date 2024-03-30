from __future__ import annotations

from typing import TYPE_CHECKING

from django.db import models
from django.db.models.manager import Manager

from recipeyak.models.base import CommonInfo

if TYPE_CHECKING:
    from recipeyak.models.recipe import Recipe  # noqa: F401
    from recipeyak.models.user import User  # noqa: F401


class RecipeFavorite(CommonInfo):
    recipe = models.ForeignKey["Recipe"]("Recipe", on_delete=models.SET_NULL, null=True)
    user = models.ForeignKey["User"]("User", on_delete=models.SET_NULL, null=True)
    objects = Manager["RecipeFavorite"]()

    class Meta:
        db_table = "recipe_favorite"
        constraints = [  # noqa: RUF012
            models.UniqueConstraint(
                fields=("recipe", "user"),
                name="recipe_user_uniq",
            )
        ]
