from enum import Enum
from typing import TYPE_CHECKING

from django.db import models
from recipeyak.models.base import CommonInfo

if TYPE_CHECKING:
    from recipeyak.models import Recipe, User  # noqa: F401


class TimelineEventKind(Enum):
    created = "created"
    archived = "archived"
    unarchived = "unarchived"
    deleted = "deleted"


class TimelineEvent(CommonInfo):
    action = models.CharField(max_length=255)
    created_by = models.ForeignKey["User"]("User", on_delete=models.CASCADE, null=True)
    recipe = models.ForeignKey["Recipe"]("Recipe", on_delete=models.CASCADE)

    class Meta:
        db_table = "timeline_event"
        ordering = ["-created"]
