from typing import TYPE_CHECKING
from django.db import models
from softdelete.models import SoftDeleteObject, SoftDeleteManager

from core.models.base import CommonInfo

if TYPE_CHECKING:
    from core.models.recipe import Recipe


class Step(CommonInfo, SoftDeleteObject):
    """Recipe step"""

    id = models.AutoField(primary_key=True)
    text = models.TextField()
    recipe = models.ForeignKey["Recipe"]("Recipe", on_delete=models.CASCADE)
    if TYPE_CHECKING:
        recipe_id: int
    position = models.FloatField()

    objects = SoftDeleteManager["Step"]()

    class Meta:
        ordering = ["position"]

    def __str__(self):
        return self.text
