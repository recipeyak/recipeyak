from typing import TYPE_CHECKING

from django.db import models
from softdelete.models import SoftDeleteManager, SoftDeleteObject

from core.models.base import CommonInfo

if TYPE_CHECKING:
    from core.models import User, Recipe, Upload, Reaction  # noqa: F401


class Note(CommonInfo, SoftDeleteObject):
    """Helpful information for a recipe"""

    text = models.TextField()
    created_by = models.ForeignKey["User"](
        "User", related_name="notes_created_by", on_delete=models.CASCADE
    )
    last_modified_by = models.ForeignKey["User"](
        "User",
        null=True,
        related_name="notes_last_modified_by",
        on_delete=models.CASCADE,
    )
    recipe = models.ForeignKey["Recipe"](
        "Recipe", related_name="notes", on_delete=models.CASCADE
    )

    uploads: "models.QuerySet[Upload]"
    reactions: "models.QuerySet[Reaction]"

    objects = SoftDeleteManager["Note"]()

    class Meta:
        ordering = ["-created"]

    def __str__(self):
        return self.text
