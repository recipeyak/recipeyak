from __future__ import annotations

from typing import TYPE_CHECKING

from django.db import models
from django.db.models.manager import Manager
from recipeyak.models.base import CommonInfo

if TYPE_CHECKING:
    from recipeyak.models.recipe import Recipe  # noqa: F401
    from recipeyak.models.user import User  # noqa: F401


class RecipeView(CommonInfo):
    """
    Track views to a given recipe on a per user basis. We avoid having a row per
    view and instead iterate a count and update the last_visited_at time.
    """

    id = models.AutoField(primary_key=True)
    recipe = models.ForeignKey["Recipe"](
        "Recipe",
        on_delete=models.CASCADE,
    )
    user = models.ForeignKey["User"](
        "User",
        on_delete=models.CASCADE,
    )
    last_visited_at = models.DateTimeField(auto_now=True)
    count = models.IntegerField()

    objects = Manager["RecipeView"]()

    class Meta:
        ordering = ["-last_visited_at"]
        db_table = "recipe_view"
        constraints = [
            models.UniqueConstraint(
                fields=("recipe", "user"),
                name="one_user_view_row_per_recipe",
            )
        ]
