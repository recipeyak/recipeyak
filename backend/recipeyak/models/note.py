from __future__ import annotations

from typing import TYPE_CHECKING

from django.db import models

from recipeyak.models.base import CommonInfo

if TYPE_CHECKING:
    from django.db.models.manager import RelatedManager

    from recipeyak.models import Reaction, Recipe, Upload, User  # noqa: F401


class Note(CommonInfo):
    """Helpful information for a recipe"""

    id: int
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

    uploads: RelatedManager[Upload]
    reactions: RelatedManager[Reaction]

    class Meta:
        ordering = ["-created"]  # noqa: RUF012
        db_table = "core_note"
