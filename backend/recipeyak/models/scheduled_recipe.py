from __future__ import annotations

from datetime import date
from typing import TYPE_CHECKING

from django.db import models

from recipeyak.models.base import CommonInfo

if TYPE_CHECKING:
    from recipeyak.models.calendar import Calendar
    from recipeyak.models.recipe import Recipe
    from recipeyak.models.team import Team
    from recipeyak.models.user import User


class ScheduledRecipeManager(models.Manager["ScheduledRecipe"]):
    def create_scheduled(
        self, recipe: Recipe, on: date, team: Team, user: User, calendar: Calendar
    ) -> ScheduledRecipe:
        """
        add to existing scheduled recipe count for dupes
        """
        return ScheduledRecipe.objects.create(
            recipe=recipe, on=on, team=team, created_by=user, calendar=calendar
        )


class ScheduledRecipe(CommonInfo):
    id = models.AutoField(primary_key=True)

    recipe = models.ForeignKey["Recipe"]("Recipe", on_delete=models.CASCADE)
    recipe_id: int

    on = models.DateField(help_text="day when recipe is scheduled")
    team = models.ForeignKey["Team"](
        "Team", on_delete=models.CASCADE, blank=True, null=True
    )
    created_by = models.ForeignKey["User"](
        "User", on_delete=models.CASCADE, null=True, related_name="+"
    )

    calendar = models.ForeignKey["Calendar"](
        "Calendar", on_delete=models.PROTECT, blank=True, null=True
    )
    calendar_id: int | None

    objects = ScheduledRecipeManager()

    class Meta:
        db_table = "core_scheduledrecipe"
        ordering = ["-on"]  # noqa: RUF012
