from __future__ import annotations

from datetime import date
from typing import TYPE_CHECKING, Any

from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.contrib.postgres.fields import ArrayField
from django.db import models
from django.db.models import QuerySet
from django.db.models.manager import BaseManager, Manager

from recipeyak.models.base import CommonInfo
from recipeyak.models.ingredient import Ingredient
from recipeyak.models.scheduled_recipe import ScheduledRecipe
from recipeyak.models.section import Section
from recipeyak.models.step import Step

if TYPE_CHECKING:
    from recipeyak.models.note import Note
    from recipeyak.models.scrape import Scrape  # noqa: F401
    from recipeyak.models.team import Team
    from recipeyak.models.upload import Upload  # noqa: F401
    from recipeyak.models.user import User


class Recipe(CommonInfo):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    author = models.CharField(max_length=255, blank=True, null=True)
    source = models.CharField(max_length=255, blank=True, null=True)
    time = models.CharField(max_length=255, blank=True, null=True)
    servings = models.CharField(max_length=255, blank=True, null=True)

    edits = models.IntegerField(default=0, editable=False)

    team = models.ForeignKey["Team"]("Team", on_delete=models.CASCADE, null=True)

    # deprecated
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    owner = GenericForeignKey("content_type", "object_id")

    archived_at = models.DateTimeField(null=True)

    cloned_at = models.DateTimeField(
        blank=True,
        null=True,
        default=None,
        help_text="If a clone, when the Recipe was cloned from a parent. Otherwise null.",
    )
    cloned_by = models.ForeignKey["User"](
        "User",
        on_delete=models.SET_NULL,
        null=True,
        help_text="If a clone, User who cloned the recipe.",
    )
    cloned_from = models.ForeignKey["Recipe"](
        "Recipe",
        on_delete=models.SET_NULL,
        null=True,
        help_text="If a clone, the parent this Recipe was cloned from.",
    )
    tags = ArrayField(
        base_field=models.TextField(),
        null=True,
        default=list,
        blank=True,
        help_text="Tags for organization recipes.",
    )
    scrape = models.ForeignKey["Scrape"]("Scrape", on_delete=models.SET_NULL, null=True)
    primary_image = models.ForeignKey["Upload"](
        "Upload", related_name="+", on_delete=models.SET_NULL, null=True
    )
    primary_image_id: int
    objects = Manager["Recipe"]()

    notes: QuerySet["Note"]

    class Meta:
        db_table = "core_recipe"

    def schedule(self, *, on: date, user: "User", team: "Team") -> ScheduledRecipe:
        return ScheduledRecipe.objects.create_scheduled(
            recipe=self, on=on, user=user, team=team
        )

    @property
    def ingredients(self) -> QuerySet[Ingredient]:
        """Return recipe ingredients ordered by creation date"""
        # TODO(sbdchd): can use reverse relation instead
        return Ingredient.objects.filter(recipe=self).order_by("created")

    @property
    def ingredient_set(self) -> QuerySet[Ingredient]:
        return self.ingredients

    @property
    def steps(self) -> BaseManager["Step"]:
        """Return recipe steps ordered by creation date"""
        # TODO(sbdchd): can use reverse relation instead
        return Step.objects.filter(recipe=self).order_by("position", "created")

    @property
    def scheduledrecipe_set(self) -> QuerySet[ScheduledRecipe]:
        return ScheduledRecipe.objects.filter(recipe=self)

    @property
    def step_set(self) -> BaseManager[Step]:
        return self.steps

    @property
    def section_set(self) -> BaseManager[Section]:
        return Section.objects.filter(recipe=self)

    def get_last_scheduled(self) -> date | None:
        """Return the most recent date this recipe was scheduled for"""
        scheduled_recipe = self.scheduledrecipe_set.first()
        if scheduled_recipe is not None:
            return scheduled_recipe.on
        return None

    def __str__(self) -> str:
        return f"{self.name} by {self.author}"

    def save(self, *args: Any, **kwargs: Any) -> None:
        is_new = self.pk is None
        if not is_new:
            # we only want to increment the edits if we aren't setting the
            # edits field specifically
            edits_unchanged = Recipe.objects.get(pk=self.id).edits == self.edits
            if edits_unchanged:
                self.edits += 1
        super().save(*args, **kwargs)
