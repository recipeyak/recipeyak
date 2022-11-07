from typing import TYPE_CHECKING

from django.db import models
from recipeyak.models.base import CommonInfo

if TYPE_CHECKING:
    from recipeyak.models import Note, Step, Upload, User  # noqa: F401


class Reaction(CommonInfo):
    emoji = models.TextField()
    created_by = models.ForeignKey["User"]("User", on_delete=models.CASCADE)
    note = models.ForeignKey["Note"](
        "Note", related_name="reactions", on_delete=models.CASCADE
    )

    note_id: int

    class Meta:
        ordering = ["-created"]
        constraints = [
            models.UniqueConstraint(
                fields=("emoji", "created_by", "note"),
                name="one_reaction_per_user",
            )
        ]
        db_table = "core_reaction"

    def __str__(self):
        return self.emoji
