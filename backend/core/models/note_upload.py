from typing import TYPE_CHECKING

from django.db import models

from core.models.base import CommonInfo

if TYPE_CHECKING:
    from core.models import Note, Upload  # noqa: F401


class NoteUpload(CommonInfo):
    note = models.ForeignKey["Note"](
        "Note",
        null=False,
        on_delete=models.PROTECT,
    )
    upload = models.ForeignKey["Upload"](
        "Upload",
        null=False,
        on_delete=models.PROTECT,
    )
