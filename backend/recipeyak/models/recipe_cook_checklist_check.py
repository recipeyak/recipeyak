from __future__ import annotations

from typing import TYPE_CHECKING

from django.db import models

from recipeyak.models.base import CommonInfo

if TYPE_CHECKING:
    from recipeyak.models.ingredient import Ingredient  # noqa: F401
    from recipeyak.models.recipe import Recipe  # noqa: F401


class RecipeCookChecklistCheck(CommonInfo):
    id = models.AutoField(primary_key=True)
    checked = models.BooleanField()

    recipe = models.ForeignKey["Recipe"](
        "Recipe",
        on_delete=models.CASCADE,
        help_text="The related recipe",
    )

    ingredient = models.ForeignKey["Ingredient"](
        "Ingredient",
        on_delete=models.CASCADE,
        help_text="The related recipe",
    )

    class Meta:
        db_table = "recipe_cook_checklist_check"

        constraints = [
            models.UniqueConstraint(
                fields=("recipe", "ingredient"),
                name="recipe_ingredient_uniq",
            )
        ]
