from typing import TYPE_CHECKING

from django.db import models

from recipeyak.models.base import CommonInfo

if TYPE_CHECKING:
    from recipeyak.models.recipe_historical import RecipeHistorical  # noqa: F401
    from recipeyak.models.step import Step  # noqa: F401
    from recipeyak.models.team import Team  # noqa: F401


class StepHistorical(CommonInfo):
    id: int
    team = models.ForeignKey["Team"]("Team", on_delete=models.CASCADE, null=True)
    team_id: int | None
    recipe_historical = models.ForeignKey["RecipeHistorical"](
        "RecipeHistorical", on_delete=models.CASCADE
    )
    # We don't use a foreign key since we want to keep the ID around after the
    # related ingredient is deleted.
    step_id = models.IntegerField()
    text = models.TextField()
    position = models.TextField()

    class Meta:
        db_table = "step_historical"
