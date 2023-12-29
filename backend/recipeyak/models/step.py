from typing import TYPE_CHECKING

from django.db import models

from recipeyak.models.base import CommonInfo

if TYPE_CHECKING:
    from recipeyak.models.recipe import Recipe  # noqa: F401


class Step(CommonInfo):
    """Recipe step"""

    id = models.AutoField(primary_key=True)
    text = models.TextField()
    recipe = models.ForeignKey["Recipe"]("Recipe", on_delete=models.CASCADE)
    recipe_id: int
    position = models.TextField(db_column="position")

    class Meta:
        db_table = "core_step"
        ordering = ["position"]  # noqa: RUF012
