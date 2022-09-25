from typing import TYPE_CHECKING

from django.db import models
from softdelete.models import SoftDeleteManager, SoftDeleteObject

from core.models.base import CommonInfo

if TYPE_CHECKING:
    from core.models import Recipe  # noqa: F401


class Ingredient(CommonInfo, SoftDeleteObject):
    """
    Recipe ingredient

    ex:
        1 medium tomato, diced

    quantity = 1 medium
    name = tomato
    description = diced

    """

    id = models.AutoField(primary_key=True)
    quantity = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    description = models.CharField(max_length=255, blank=True)
    recipe = models.ForeignKey["Recipe"]("Recipe", on_delete=models.CASCADE)
    recipe_id: int
    _deprecated_position = models.FloatField(
        null=True, db_column="_deprecated_position"
    )
    position = models.TextField(db_column="position")
    optional = models.BooleanField(default=False)

    objects = SoftDeleteManager["Ingredient"]()

    class Meta:
        ordering = ["position"]

    def __str__(self):
        return f"{self.quantity} {self.name} {self.description}"

    def __repr__(self):
        optional = "[optional]" if self.optional else ""
        return f"<quantity={self.quantity} {self.name} description={self.description} recipe={self.recipe} {optional}>"
