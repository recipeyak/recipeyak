from __future__ import annotations

from typing import TYPE_CHECKING

from django.db import models

from recipeyak.models.base import CommonInfo

if TYPE_CHECKING:
    from recipeyak.models.team import Team  # noqa: F401


class Calendar(CommonInfo):
    id = models.AutoField(primary_key=True)

    team = models.ForeignKey["Team"](
        "Team", on_delete=models.CASCADE, blank=True, null=True
    )

    name = models.TextField(help_text="Name of calendar, e.g. 'Family Calendar'")

    class Meta:
        db_table = "core_calendar"
        ordering = ["name"]  # noqa: RUF012
