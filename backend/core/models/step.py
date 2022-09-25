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
    _deprecated_position = models.FloatField(
        null=True, db_column="_deprecated_position"
    )
    position = models.TextField(db_column="position")

    objects = SoftDeleteManager["Step"]()

    class Meta:
        ordering = ["position"]

    def __str__(self):
        return self.text
