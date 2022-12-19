from typing import TYPE_CHECKING

from django.db import models

from recipeyak.models.base import CommonInfo

if TYPE_CHECKING:
    from recipeyak.models import ScheduledRecipe, User  # noqa: F401


class ScheduleEvent(CommonInfo):
    """
    Track changes to a Scheduled Recipe's `on` (date) field
    """

    scheduled_recipe = models.ForeignKey["ScheduledRecipe"](
        "ScheduledRecipe", on_delete=models.CASCADE
    )
    actor = models.ForeignKey["User"]("User", on_delete=models.CASCADE)
    before_on = models.DateField()
    after_on = models.DateField()

    class Meta:
        db_table = "schedule_event"
        ordering = ["-created"]
