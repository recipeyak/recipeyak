from typing import TYPE_CHECKING

from django.db import models

from recipeyak.models.base import CommonInfo

if TYPE_CHECKING:
    from recipeyak.models.recipe import Recipe  # noqa: F401


class Section(CommonInfo):
    """
    Recipe ingredient section. Used to divide the ingredients into groups for
    the UI.
    """

    id = models.AutoField(primary_key=True)

    recipe = models.ForeignKey["Recipe"](
        "Recipe", on_delete=models.CASCADE, help_text="Recipe the section is part of."
    )
    recipe_id: int
    title = models.CharField(
        max_length=255, help_text="name of the ingredient section group"
    )
    position = models.TextField(db_column="position")

    class Meta:
        db_table = "core_section"
        ordering = ["position"]  # noqa: RUF012
        constraints = [  # noqa: RUF012
            models.UniqueConstraint(
                fields=("recipe", "position"),
                name="section_recipe_position_uniq",
            )
        ]

    def __repr__(self) -> str:
        return f"<Section id={self.id} title='{self.title}' position='{self.position}'>"
