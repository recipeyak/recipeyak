from typing import TYPE_CHECKING

from django.db import models
from softdelete.models import SoftDeleteManager, SoftDeleteObject

from core.models.base import CommonInfo

if TYPE_CHECKING:
    from core.models.recipe import Recipe  # noqa: F401


class Section(CommonInfo, SoftDeleteObject):
    """
    Recipe ingredient section. Used to divide the ingredients into groups for
    the UI.
    """

    id = models.AutoField(primary_key=True)

    recipe = models.ForeignKey["Recipe"](
        "Recipe", on_delete=models.CASCADE, help_text="Recipe the section is part of."
    )
    title = models.CharField(
        max_length=255, help_text="name of the ingredient section group"
    )
    position = models.TextField()

    objects = SoftDeleteManager["Section"]()

    class Meta:
        ordering = ["position"]

    def __repr__(self):
        return f"<Section id={self.id} title='{self.title}' position='{self.position}'>"
