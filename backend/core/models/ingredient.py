from django.db import models
from softdelete.models import SoftDeleteObject

from core.models.base import CommonInfo


class Ingredient(CommonInfo, SoftDeleteObject):
    """
    Recipe ingredient

    ex:
        1 medium tomato, diced

    quantity = 1 medium
    name = tomato
    description = diced

    """

    quantity = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    description = models.CharField(max_length=255, blank=True)
    recipe = models.ForeignKey("Recipe", on_delete=models.CASCADE)
    position = models.FloatField()
    optional = models.BooleanField(default=False)

    class Meta:
        ordering = ["position"]

    def __str__(self):
        return f"{self.quantity} {self.name} {self.description}"

    def __repr__(self):
        optional = "[optional]" if self.optional else ""
        return f"<quantity={self.quantity} {self.name} description={self.description} recipe={self.recipe} {optional}>"
