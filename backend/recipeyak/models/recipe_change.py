import enum
from typing import TYPE_CHECKING

from django.db import models
from django.db.models.manager import Manager
from recipeyak.models.base import CommonInfo
from recipeyak.models.recipe import Recipe

if TYPE_CHECKING:
    from recipeyak.models import User  # noqa: F401


@enum.unique
class ChangeType(str, enum.Enum):
    NAME = "NAME"
    AUTHOR = "AUTHOR"
    SOURCE = "SOURCE"
    SERVINGS = "SERVINGS"
    TIME = "TIME"

    STEP_CREATE = "STEP_CREATE"
    STEP_UPDATE = "STEP_UPDATE"
    STEP_DELETE = "STEP_DELETE"

    INGREDIENT_CREATE = "INGREDIENT_CREATE"
    INGREDIENT_UPDATE = "INGREDIENT_UPDATE"
    INGREDIENT_DELETE = "INGREDIENT_DELETE"

    SECTION_CREATE = "SECTION_CREATE"
    SECTION_UPDATE = "SECTION_UPDATE"
    SECTION_DELETE = "SECTION_DELETE"


class RecipeChange(CommonInfo):
    """
    Record changes of a recipe. Useful for constructing a timeline of a
    recipe's evolution.
    """

    recipe = models.ForeignKey(
        Recipe,
        on_delete=models.SET_NULL,
        help_text="Recipe this change is for.",
        null=True,
    )

    actor = models.ForeignKey["User"](
        "User", on_delete=models.CASCADE, help_text="User who made the change."
    )

    before = models.TextField(
        blank=True,
        help_text="The previous value, sometimes derived from multiple fields",
    )

    after = models.TextField(
        blank=False, help_text="The new value, sometimes derived from multiple fields"
    )

    change_type = models.CharField(
        choices=[(c.value, c.value) for c in ChangeType],
        max_length=255,
        help_text="The field / model changed.",
    )

    objects = Manager["RecipeChange"]()

    class Meta:
        db_table = "core_recipechange"
