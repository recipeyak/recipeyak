from __future__ import annotations

import itertools
from datetime import date
from typing import TYPE_CHECKING, Any, Optional, Union

from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.contrib.postgres.fields import ArrayField
from django.db import models, transaction
from django.db.models import QuerySet
from django.utils import timezone
from softdelete.models import SoftDeleteManager, SoftDeleteObject

from core.models.base import CommonInfo
from core.models.ingredient import Ingredient
from core.models.scheduled_recipe import ScheduledRecipe
from core.models.section import Section
from core.models.step import Step

if TYPE_CHECKING:
    from core.models.user import User
    from core.models.team import Team
    from core.models.note import Note
    from core.models.scrape import Scrape  # noqa: F401


class Recipe(CommonInfo, SoftDeleteObject):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    author = models.CharField(max_length=255, blank=True, null=True)
    source = models.CharField(max_length=255, blank=True, null=True)
    time = models.CharField(max_length=255, blank=True, null=True)
    servings = models.CharField(max_length=255, blank=True, null=True)

    edits = models.IntegerField(default=0, editable=False)

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

    objects = SoftDeleteManager["Recipe"]()

    notes: QuerySet["Note"]

    def move_to(self, account: Union[User, Team]) -> "Recipe":
        """
        Move recipe from current owner to another team or user

        All we need to do is change the owner for this one.
            - Steps and Ingredients will be fine since we aren't changing pk's
        """
        with transaction.atomic():
            self.owner = account
            self.save()
            return self

    def copy_to(self, *, actor: User, account: Union[User, Team]) -> "Recipe":
        """
        Copy recipe to another team or user
        """
        return self.duplicate(actor=actor, account=account, update_title=False)

    def duplicate(
        self,
        *,
        actor: User,
        update_title: bool = True,
        account: Union[User, Team, None] = None,
    ) -> "Recipe":
        """
        Duplicate / clone a recipe to its current owner
        """
        with transaction.atomic():
            # clone top level recipe object
            original = self
            recipe_copy = Recipe.objects.get(pk=original.pk)
            recipe_copy.pk = None
            recipe_copy.name += " (copy)"
            if account is not None:
                recipe_copy.owner = account
            recipe_copy.cloned_from = original
            recipe_copy.cloned_by = actor
            recipe_copy.cloned_at = timezone.now()
            recipe_copy.save()

            for recipe_component in itertools.chain(self.steps, self.ingredients):
                recipe_component.pk = None
                # alternative to recipe_copy.steps_set.add(step)
                # this is required due to the db constraint on recipe, position
                recipe_component.recipe_id = (  # type: ignore [attr-defined]
                    recipe_copy.pk
                )
                recipe_component.save()
            recipe_copy.save()
            return recipe_copy

    # TODO(sbdchd): this needs an `@overload` for the user case an the team
    # case since they can't occur at the same time.
    def schedule(
        self,
        *,
        on: date,
        user: Optional["User"] = None,
        team: Optional["Team"] = None,
        count: int = 1,
    ):
        return ScheduledRecipe.objects.create_scheduled(
            recipe=self, on=on, count=count, user=user, team=team
        )

    @property
    def ingredients(self) -> SoftDeleteManager[Ingredient]:
        """Return recipe ingredients ordered by creation date"""
        # TODO(sbdchd): can use reverse relation instead
        return Ingredient.objects.filter(recipe=self).order_by("created")

    @property
    def ingredient_set(self) -> SoftDeleteManager[Ingredient]:
        return self.ingredients

    @property
    def steps(self) -> SoftDeleteManager["Step"]:
        """Return recipe steps ordered by creation date"""
        # TODO(sbdchd): can use reverse relation instead
        return Step.objects.filter(recipe=self).order_by("position", "created")

    @property
    def scheduledrecipe_set(self) -> QuerySet[ScheduledRecipe]:
        return ScheduledRecipe.objects.filter(recipe=self)

    @property
    def step_set(self) -> SoftDeleteManager[Step]:
        return self.steps

    @property
    def section_set(self) -> QuerySet[Section]:
        return Section.objects.filter(recipe=self)

    def get_last_scheduled(self) -> Optional[date]:
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
