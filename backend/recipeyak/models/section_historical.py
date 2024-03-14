from typing import TYPE_CHECKING

from django.db import models

from recipeyak.models.base import CommonInfo

if TYPE_CHECKING:
    from recipeyak.models.recipe import Recipe  # noqa: F401
    from recipeyak.models.recipe_historical import RecipeHistorical  # noqa: F401
    from recipeyak.models.section import Section  # noqa: F401
    from recipeyak.models.team import Team  # noqa: F401


class SectionHistorical(CommonInfo):
    id: int
    team = models.ForeignKey["Team"]("Team", on_delete=models.CASCADE, null=True)
    recipe_historical = models.ForeignKey["RecipeHistorical"](
        "RecipeHistorical", on_delete=models.CASCADE
    )
    # We don't use a foreign key since we want to keep the ID around after the
    # related section is deleted.
    section_id = models.IntegerField()
    title = models.CharField(max_length=255)
    position = models.TextField()

    class Meta:
        db_table = "section_historical"
