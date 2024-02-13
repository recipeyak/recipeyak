from __future__ import annotations

from typing import TYPE_CHECKING

from django.contrib.postgres.fields import ArrayField
from django.db import models

from recipeyak.models.base import CommonInfo

if TYPE_CHECKING:
    from recipeyak.models.note import Note as Note
    from recipeyak.models.user import User as User


class NoteHistorical(CommonInfo):
    id: int
    actor = models.ForeignKey["User"]("User", on_delete=models.CASCADE)
    note = models.ForeignKey["Note"]("Note", on_delete=models.CASCADE)
    note_id: int
    text = models.TextField()
    upload_ids = ArrayField(models.IntegerField(), blank=True)

    class Meta:
        db_table = "note_historical"
