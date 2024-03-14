from __future__ import annotations

from typing import TYPE_CHECKING

from django.contrib.postgres.fields import ArrayField
from django.db import models
from django.db.models.manager import Manager

from recipeyak.models.base import CommonInfo

if TYPE_CHECKING:
    from django.db.models.manager import RelatedManager

    from recipeyak.models.ingredient_historical import IngredientHistorical
    from recipeyak.models.recipe import Recipe  # noqa: F401
    from recipeyak.models.section_historical import SectionHistorical
    from recipeyak.models.step_historical import StepHistorical
    from recipeyak.models.team import Team  # noqa: F401
    from recipeyak.models.upload import Upload  # noqa: F401
    from recipeyak.models.user import User  # noqa: F401


class RecipeHistorical(CommonInfo):
    id: int
    # shouldn't be null but we have some historical data :/
    team = models.ForeignKey["Team"]("Team", on_delete=models.CASCADE, null=True)
    recipe = models.ForeignKey["Recipe"]("Recipe", on_delete=models.CASCADE)
    actor = models.ForeignKey["User"]("User", on_delete=models.SET_NULL, null=True)
    name = models.CharField(max_length=255)
    author = models.CharField(max_length=255, blank=True, null=True)
    source = models.CharField(max_length=255, blank=True, null=True)
    time = models.CharField(max_length=255, blank=True, null=True)
    servings = models.CharField(max_length=255, blank=True, null=True)
    archived_at = models.DateTimeField(null=True)
    tags = ArrayField(
        base_field=models.TextField(), null=True, default=list, blank=True
    )
    # primary_image is shared between the actual models and historical models
    primary_image = models.ForeignKey["Upload"](
        "Upload", related_name="+", on_delete=models.PROTECT, null=True
    )
    objects = Manager["RecipeHistorical"]()

    class Meta:
        db_table = "recipe_historical"

    ingredient_historical_set: RelatedManager[IngredientHistorical]
    section_historical_set: RelatedManager[SectionHistorical]
    step_historical_set: RelatedManager[StepHistorical]
