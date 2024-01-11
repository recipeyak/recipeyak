from typing import TYPE_CHECKING

from django.db import models

from recipeyak.models.base import CommonInfo

if TYPE_CHECKING:
    from recipeyak.models import Recipe  # noqa: F401


class Ingredient(CommonInfo):
    """
    Recipe ingredient

    ex:
        1 medium tomato, diced

    quantity = 1 medium
    name = tomato
    description = diced

    """

    pk: int
    id = models.AutoField(primary_key=True)
    quantity = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    description = models.CharField(max_length=255, blank=True)
    recipe = models.ForeignKey["Recipe"]("Recipe", on_delete=models.CASCADE)
    recipe_id: int
    position = models.TextField(db_column="position")
    optional = models.BooleanField(default=False)

    class Meta:
        ordering = ["position"]  # noqa: RUF012
        db_table = "core_ingredient"

    def __repr__(self) -> str:
        optional = "[optional]" if self.optional else ""
        return f"<quantity={self.quantity} {self.name} description={self.description} recipe={self.recipe} {optional}>"
