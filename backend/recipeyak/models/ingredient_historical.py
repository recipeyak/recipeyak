from typing import TYPE_CHECKING

from django.db import models

from recipeyak.models.base import CommonInfo

if TYPE_CHECKING:
    from recipeyak.models.ingredient import Ingredient  # noqa: F401
    from recipeyak.models.recipe_historical import RecipeHistorical  # noqa: F401
    from recipeyak.models.team import Team  # noqa: F401


class IngredientHistorical(CommonInfo):
    id: int
    team = models.ForeignKey["Team"]("Team", on_delete=models.CASCADE, null=True)
    recipe_historical = models.ForeignKey["RecipeHistorical"](
        "RecipeHistorical", on_delete=models.CASCADE
    )
    # We don't use a foreign key since we want to keep the ID around after the
    # related ingredient is deleted.
    ingredient_id = models.IntegerField()
    quantity = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    description = models.CharField(max_length=255, blank=True)
    position = models.TextField()
    optional = models.BooleanField(default=False)

    class Meta:
        db_table = "ingredient_historical"
