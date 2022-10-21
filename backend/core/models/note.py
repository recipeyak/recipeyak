from typing import TYPE_CHECKING

from django.db import models
from django.db.models.functions import Length

from core.models.base import CommonInfo

if TYPE_CHECKING:
    from core.models import User, Recipe, Upload, Reaction  # noqa: F401


models.TextField.register_lookup(Length)


class Note(CommonInfo):
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

    class Meta:
        ordering = ["-created"]
        constraints = [
            models.CheckConstraint(
                check=models.Q(text__length__gt=0),
                name="minimum_length_required",
            )
        ]

    def __str__(self):
        return self.text
