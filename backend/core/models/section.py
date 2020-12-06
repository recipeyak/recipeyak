from django.db import models
from softdelete.models import SoftDeleteObject, SoftDeleteManager

from core.models.base import CommonInfo
from core.models import Recipe


class Section(CommonInfo, SoftDeleteObject):
    """
    Recipe ingredient section. Used to divide the ingredients into groups for
    the UI.
    """

    id = models.AutoField(primary_key=True)

    recipe = models.ForeignKey(
        Recipe, on_delete=models.CASCADE, help_text="Recipe the section is part of."
    )
    title = models.CharField(
        max_length=255, help_text="name of the ingredient section group"
    )
    position = models.FloatField(
        help_text="position of the section across both the ingredients and other sections for a recipe."
    )

    objects = SoftDeleteManager["Section"]()

    class Meta:
        ordering = ["position"]

    def __repr__(self):
        return f"<Section id={self.id} title='{self.title}' position='{self.position}'>"
