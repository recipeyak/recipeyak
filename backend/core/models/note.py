from django.db import models
from softdelete.models import SoftDeleteObject

from core.models.base import CommonInfo


class Note(CommonInfo, SoftDeleteObject):
    """Helpful information for a recipe"""

    text = models.TextField()
    created_by = models.ForeignKey(
        "MyUser", related_name="notes_created_by", on_delete=models.CASCADE
    )
    last_modified_by = models.ForeignKey(
        "MyUser",
        null=True,
        related_name="notes_last_modified_by",
        on_delete=models.CASCADE,
    )
    recipe = models.ForeignKey("Recipe", on_delete=models.CASCADE)

    class Meta:
        ordering = ["-created"]

    def __str__(self):
        return self.text
