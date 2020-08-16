from __future__ import annotations

import itertools
from datetime import date, datetime
from typing import TYPE_CHECKING, Optional, Union

from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models, transaction
from django.utils import timezone
from softdelete.models import SoftDeleteObject

from core.models.base import CommonInfo
from core.models.ingredient import Ingredient
from core.models.scheduled_recipe import ScheduledRecipe
from core.models.step import Step

if TYPE_CHECKING:
    from core.models.my_user import MyUser
    from core.models.team import Team


class Recipe(CommonInfo, SoftDeleteObject):
    name = models.CharField(max_length=255)
    author = models.CharField(max_length=255, blank=True, null=True)
    source = models.CharField(max_length=255, blank=True, null=True)
    time = models.CharField(max_length=255, blank=True, null=True)
    servings = models.CharField(max_length=255, blank=True, null=True)

    edits = models.IntegerField(default=0, editable=False)

    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    owner = GenericForeignKey("content_type", "object_id")

    cloned_at = models.DateTimeField(
        blank=True,
        null=True,
        default=None,
        help_text="If a clone, when the Recipe was cloned from a parent. Otherwise null.",
    )
    cloned_by = models.ForeignKey(
        "MyUser",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        default=None,
        help_text="If a clone, User who cloned the recipe.",
    )
    cloned_from = models.ForeignKey(
        "Recipe",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        default=None,
        help_text="If a clone, the parent this Recipe was cloned from.",
    )

    def move_to(self, account: Union[MyUser, Team]) -> "Recipe":
        """
        Move recipe from current owner to another team or user

        All we need to do is change the owner for this one.
            - Steps and Ingredients will be fine since we aren't changing pk's
        """
        with transaction.atomic():
            self.owner = account
            self.save()
            return self

    def copy_to(self, *, actor: MyUser, account: Union[MyUser, Team]) -> "Recipe":
        """
        Copy recipe to another team or user
        """
        return self.duplicate(actor=actor, account=account, update_title=False)

    def duplicate(
        self,
        *,
        actor: MyUser,
        update_title: bool = True,
        account: Union[MyUser, Team, None] = None,
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
                recipe_component.recipe_id = recipe_copy.pk
                recipe_component.save()
            recipe_copy.save()
            return recipe_copy

    # TODO(sbdchd): this needs an `@overload` for the user case an the team
    # case since they can't occur at the same time.
    def schedule(
        self,
        *,
        on: date,
        user: Optional["MyUser"] = None,
        team: Optional["Team"] = None,
        count: int = 1,
    ):
        return ScheduledRecipe.objects.create_scheduled(
            recipe=self, on=on, count=count, user=user, team=team
        )

    @property
    def ingredients(self):
        """Return recipe ingredients ordered by creation date"""
        # TODO(sbdchd): can use reverse relation instead
        return Ingredient.objects.filter(recipe=self).order_by("created")

    @property
    def steps(self):
        """Return recipe steps ordered by creation date"""
        # TODO(sbdchd): can use reverse relation instead
        return Step.objects.filter(recipe=self).order_by("position", "created")

    def get_last_scheduled(self) -> Optional[datetime]:
        """Return the most recent date this recipe was scheduled for"""
        scheduled_recipe = self.scheduledrecipe_set.first()
        if scheduled_recipe is not None:
            return scheduled_recipe.on
        return None

    def __str__(self):
        return f"{self.name} by {self.author}"

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        if not is_new:
            # we only want to increment the edits if we aren't setting the
            # edits field specifically
            edits_unchanged = Recipe.objects.get(pk=self.id).edits == self.edits
            if edits_unchanged:
                self.edits += 1
        super().save(*args, **kwargs)
