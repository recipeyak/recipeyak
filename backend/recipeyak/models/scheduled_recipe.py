from __future__ import annotations

from datetime import date
from typing import TYPE_CHECKING

from django.db import models

from recipeyak.models.base import CommonInfo

if TYPE_CHECKING:
    from recipeyak.models.recipe import Recipe
    from recipeyak.models.team import Team
    from recipeyak.models.user import User


class ScheduledRecipeManager(models.Manager["ScheduledRecipe"]):
    def create_scheduled(
        self,
        recipe: Recipe,
        on: date,
        team: Team,
        user: User,
    ) -> ScheduledRecipe:
        """
        add to existing scheduled recipe count for dupes
        """
        return ScheduledRecipe.objects.create(
            recipe=recipe, on=on, team=team, created_by=user
        )


class ScheduledRecipe(CommonInfo):
    id = models.AutoField(primary_key=True)

    recipe = models.ForeignKey["Recipe"]("Recipe", on_delete=models.CASCADE)
    recipe_id: int

    on = models.DateField(help_text="day when recipe is scheduled")
    # user is deprecated
    user = models.ForeignKey["User"](
        "User", on_delete=models.CASCADE, blank=True, null=True
    )
    team = models.ForeignKey["Team"](
        "Team", on_delete=models.CASCADE, blank=True, null=True
    )
    created_by = models.ForeignKey["User"](
        "User", on_delete=models.CASCADE, null=True, related_name="+"
    )

    objects = ScheduledRecipeManager()

    class Meta:
        db_table = "core_scheduledrecipe"
        ordering = ["-on"]  # noqa: RUF012
        # This was previously defined in raw sql: https://github.com/recipeyak/recipeyak/blob/8952d2592f8a13edfcaa63566d99c83c7594a910/backend/core/migrations/0061_auto_20180630_0131.py#L10-L20
        constraints = [  # noqa: RUF012
            models.CheckConstraint(
                check=models.Q(~(models.Q(team_id=None) & models.Q(user_id=None))),
                name="owner_required",
            )
        ]

    def __str__(self) -> str:
        owner = self.user if not self.team else self.team
        return f"ScheduledRecipe:: {self.recipe.name} on {self.on} for {owner}"
