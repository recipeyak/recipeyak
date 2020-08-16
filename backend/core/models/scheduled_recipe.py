from __future__ import annotations

from datetime import date
from typing import TYPE_CHECKING, Optional

from django.core.validators import MinValueValidator
from django.db import models, transaction

from core.models.base import CommonInfo

if TYPE_CHECKING:
    from core.models.recipe import Recipe
    from core.models.team import Team
    from core.models.my_user import MyUser


class ScheduledRecipeManager(models.Manager):
    def create_scheduled(
        self,
        recipe: Recipe,
        on: date,
        team: Optional[Team],
        count: int,
        user: Optional[MyUser],
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
                recipe=recipe, on=on, count=count, team=team, user=user
            )


class ScheduledRecipe(CommonInfo):
    recipe = models.ForeignKey("Recipe", on_delete=models.CASCADE)
    on = models.DateField(help_text="day when recipe is scheduled")
    count = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    # TODO(sbdchd): add restriction so that only one of these is set
    user = models.ForeignKey("MyUser", on_delete=models.CASCADE, blank=True, null=True)
    team = models.ForeignKey("Team", on_delete=models.CASCADE, blank=True, null=True)

    objects = ScheduledRecipeManager()

    class Meta:
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
