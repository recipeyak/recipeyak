from django.db import models
from softdelete.models import SoftDeleteObject

from core.models.base import CommonInfo


class Step(CommonInfo, SoftDeleteObject):
    """Recipe step"""

    text = models.TextField()
    recipe = models.ForeignKey("Recipe", on_delete=models.CASCADE)
    position = models.FloatField()

    class Meta:
        ordering = ["position"]

    def __str__(self):
        return self.text
