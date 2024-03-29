from typing import TYPE_CHECKING

from django.db import models

from recipeyak.models.base import CommonInfo

if TYPE_CHECKING:
    from recipeyak.models import Recipe, Upload, User  # noqa: F401


class TimelineEvent(CommonInfo):
    id: int
    action = models.CharField(max_length=255)
    created_by = models.ForeignKey["User"]("User", on_delete=models.CASCADE, null=True)
    created_by_id: int | None
    recipe = models.ForeignKey["Recipe"]("Recipe", on_delete=models.CASCADE)
    upload = models.ForeignKey["Upload"]("Upload", on_delete=models.SET_NULL, null=True)

    class Meta:
        db_table = "timeline_event"
        ordering = ["-created"]  # noqa: RUF012
