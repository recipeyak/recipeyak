import enum

from django.db import models

from core.models.base import CommonInfo


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

    actor = models.ForeignKey(
        "MyUser", on_delete=models.CASCADE, help_text="User who made the change."
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
