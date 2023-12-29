from __future__ import annotations

from typing import TYPE_CHECKING

from django.db import models
from django.db.models.manager import Manager

from recipeyak.models.base import CommonInfo

if TYPE_CHECKING:
    from recipeyak.models.recipe import Recipe  # noqa: F401


class RecipeIndexQueue(CommonInfo):
    id = models.AutoField(primary_key=True)
    recipe = models.ForeignKey["Recipe"]("Recipe", on_delete=models.CASCADE)

    objects = Manager["RecipeIndexQueue"]()

    class Meta:
        db_table = "recipe_index_queue"
