from __future__ import annotations

from datetime import date
from typing import TYPE_CHECKING, Optional

from django.core.validators import MinValueValidator
from django.db import models, transaction
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
        team: Optional[Team],
        count: int,
        user: User,
    ) -> "ScheduledRecipe":
        """
        add to existing scheduled recipe count for dupes
        """
        with transaction.atomic():
            # TODO(sbdchd): revist this and consider if it does what we want
            existing = ScheduledRecipe.objects.filter(
                recipe=recipe, on=on, team=team, user=user
            ).first()
            if existing:
                existing.count += count
                existing.save()
                return existing
            return ScheduledRecipe.objects.create(
                recipe=recipe, on=on, count=count, team=team, user=user, created_by=user
            )


class ScheduledRecipe(CommonInfo):
    id = models.AutoField(primary_key=True)

    recipe = models.ForeignKey["Recipe"]("Recipe", on_delete=models.CASCADE)
    recipe_id: int

    on = models.DateField(help_text="day when recipe is scheduled")
    count = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    # TODO(sbdchd): add restriction so that only one of these is set
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
        unique_together = (("recipe", "on", "user"), ("recipe", "on", "team"))
        ordering = ["-on"]
        # This was previously defined in raw sql: https://github.com/recipeyak/recipeyak/blob/8952d2592f8a13edfcaa63566d99c83c7594a910/backend/core/migrations/0061_auto_20180630_0131.py#L10-L20
        constraints = [
            models.CheckConstraint(
                check=models.Q(~(models.Q(team_id=None) & models.Q(user_id=None))),
                name="owner_required",
            )
        ]

    def __str__(self):
        owner = self.user if not self.team else self.team
        return f"ScheduledRecipe:: {self.count} of {self.recipe.name} on {self.on} for {owner}"
