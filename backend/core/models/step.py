from typing import TYPE_CHECKING

from django.db import models
from softdelete.models import SoftDeleteManager, SoftDeleteObject

from core.models.base import CommonInfo

if TYPE_CHECKING:
    from core.models.recipe import Recipe  # noqa: F401


class Step(CommonInfo, SoftDeleteObject):
    """Recipe step"""

    id = models.AutoField(primary_key=True)
    text = models.TextField()
    recipe = models.ForeignKey["Recipe"]("Recipe", on_delete=models.CASCADE)
    recipe_id: int
    position = models.TextField()

    objects = SoftDeleteManager["Step"]()

    class Meta:
        ordering = ["position"]

    def __str__(self):
        return self.text
