import enum
import hashlib
import itertools
import logging
from datetime import date, datetime
from typing import List, Optional, Union, cast

from allauth.socialaccount.models import EmailAddress
from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.contrib.contenttypes.fields import GenericForeignKey, GenericRelation
from django.contrib.contenttypes.models import ContentType
from django.contrib.postgres.fields import CIEmailField, JSONField
from django.core.validators import MinValueValidator
from django.db import models, transaction
from django.db.models import Q
from django.utils import timezone
from softdelete.models import SoftDeleteObject
from typing_extensions import Literal

logger = logging.getLogger(__name__)


class MyUserManager(BaseUserManager):
    def create_user(self, email: str, password: Optional[str] = None) -> "MyUser":
        """
        Creates and saves a user with given email and password.
        """
        if not email:
            raise ValueError("User must have an email address")
        with transaction.atomic():
            user = self.model(email=self.normalize_email(email))
            user.set_password(password)
            user.save(using=self._db)
            EmailAddress.objects.create(user=user, email=email)
            logger.info("Created new user: %s", user)
            return user

    def create_superuser(self, email: str, password: str) -> "MyUser":
        """
        Creates and saves a superuser with the given email and password.
        """
        user = self.create_user(email=email, password=password)
        user.is_admin = True
        user.is_superuser = True
        user.save(using=self._db)
        return user


class MyUser(AbstractBaseUser, PermissionsMixin):
    """Custom user model that only requires an email and password"""

    email = CIEmailField(unique=True)

    # required for admin
    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)

    created = models.DateField(auto_now_add=True)
    last_updated = models.DateField(auto_now=True)

    recipes = GenericRelation("Recipe", related_query_name="owner_user")

    # UI settings we wish to sync across sessions
    dark_mode_enabled = models.BooleanField(
        default=False, help_text="frontend darkmode setting"
    )
    selected_team = models.ForeignKey(
        "Team",
        null=True,
        blank=True,
        help_text="team currently focused on UI, null if personal items selected.",
        on_delete=models.SET_NULL,
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS: List[str] = []

    objects = MyUserManager()

    def get_full_name(self):
        return self.email

    def get_short_name(self):
        return self.email

    # required for admin
    def has_perm(self, perm, obj=None):
        """Does the user have a specific permission?"""
        # TODO: Add permissions
        return True

    # required for admin
    def has_module_perms(self, app_label):
        """Does the user have permissions to view the app `app_label`?"""
        # TODO: Add permissions
        return True

    def has_invite(self, team: "Team") -> bool:
        """
        Return if user has invite to team.
        """
        return self.membership_set.filter(team=team).exclude(invite=None).exists()

    def has_team(self) -> bool:
        return self.membership_set.filter(invite=None).exists()

    # required for admin
    @property
    def is_staff(self):
        return self.is_admin

    @property
    def avatar_url(self):
        md5_email = hashlib.md5(self.email.encode("utf-8")).hexdigest()
        # indenticons by default `d=identicon`
        # Avatars with ratings of G only `r=g`
        # https://secure.gravatar.com/site/implement/images/
        return f"/avatar/{md5_email}?d=identicon&r=g"

    @property
    def scheduled_recipes(self):
        return ScheduledRecipe.objects.filter(user=self)

    def __str__(self):
        return self.email


class CommonInfo(models.Model):
    """Abstract model for storing common model info"""

    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


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

    def move_to(self, account: Union[MyUser, "Team"]) -> "Recipe":
        """
        Move recipe from current owner to another team or user

        All we need to do is change the owner for this one.
            - Steps and Ingredients will be fine since we aren't changing pk's
        """
        with transaction.atomic():
            self.owner = account
            self.save()
            return self

    def copy_to(self, *, actor: "MyUser", account: Union[MyUser, "Team"]) -> "Recipe":
        """
        Copy recipe to another team or user
        """
        return self.duplicate(actor=actor, account=account, update_title=False)

    def duplicate(
        self,
        *,
        actor: "MyUser",
        update_title: bool = True,
        account: Union[MyUser, "Team", None] = None,
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
        user: Optional[MyUser] = None,
        team: Optional["Team"] = None,
        count: int = 1,
    ):
        return ScheduledRecipe.objects.create_scheduled(
            recipe=self, on=on, count=count, user=user, team=team
        )

    @property
    def ingredients(self):
        """Return recipe ingredients ordered by creation date"""
        return Ingredient.objects.filter(recipe=self).order_by("created")

    @property
    def steps(self):
        """Return recipe steps ordered by creation date"""
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


class Ingredient(CommonInfo, SoftDeleteObject):
    """
    Recipe ingredient

    ex:
        1 medium tomato, diced

    quantity = 1 medium
    name = tomato
    description = diced

    """

    quantity = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    description = models.CharField(max_length=255, blank=True)
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)
    position = models.FloatField()
    optional = models.BooleanField(default=False)

    class Meta:
        unique_together = (("recipe", "position"),)
        ordering = ["position"]

    def __str__(self):
        return f"{self.quantity} {self.name} {self.description}"

    def __repr__(self):
        optional = "[optional]" if self.optional else ""
        return f"<quantity={self.quantity} {self.name} description={self.description} recipe={self.recipe} {optional}>"


class Step(CommonInfo, SoftDeleteObject):
    """Recipe step"""

    text = models.TextField()
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)
    position = models.FloatField()

    class Meta:
        unique_together = (("recipe", "position"),)
        ordering = ["position"]

    def __str__(self):
        return self.text


class Note(CommonInfo, SoftDeleteObject):
    """Helpful information for a recipe"""

    text = models.TextField()
    created_by = models.ForeignKey(
        MyUser, related_name="notes_created_by", on_delete=models.CASCADE
    )
    last_modified_by = models.ForeignKey(
        MyUser,
        null=True,
        related_name="notes_last_modified_by",
        on_delete=models.CASCADE,
    )
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)

    class Meta:
        ordering = ["-created"]

    def __str__(self):
        return self.text


class ScheduledRecipeManager(models.Manager):
    def create_scheduled(
        self, recipe: Recipe, on, team, count: int, user: MyUser
    ) -> "ScheduledRecipe":
        """
        add to existing scheduled recipe count for dupes
        """
        with transaction.atomic():
            # TODO(sbdchd): revist this and consider if it does what we want
            existing = ScheduledRecipe.objects.filter(
                recipe=recipe, on=on, team=team, user=user
            ).first()
            if existing:
                existing.count += count
                existing.save()
                return existing
            return ScheduledRecipe.objects.create(
                recipe=recipe, on=on, count=count, team=team, user=user
            )


class ScheduledRecipe(CommonInfo):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)
    on = models.DateField(help_text="day when recipe is scheduled")
    count = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    # TODO(sbdchd): add restriction so that only one of these is set
    user = models.ForeignKey(MyUser, on_delete=models.CASCADE, blank=True, null=True)
    team = models.ForeignKey("Team", on_delete=models.CASCADE, blank=True, null=True)

    objects = ScheduledRecipeManager()

    class Meta:
        unique_together = (("recipe", "on", "user"), ("recipe", "on", "team"))
        ordering = ["-on"]
        # This was previously defined in raw sql: https://github.com/recipeyak/recipeyak/blob/8952d2592f8a13edfcaa63566d99c83c7594a910/backend/core/migrations/0061_auto_20180630_0131.py#L10-L20
        constraints = [
            models.CheckConstraint(
                check=models.Q(~(models.Q(team_id=None) & models.Q(user_id=None))),
                name="owner_required",
            )
        ]

    def __str__(self):
        owner = self.user if not self.team else self.team
        return f"ScheduledRecipe:: {self.count} of {self.recipe.name} on {self.on} for {owner}"


class InviteManager(models.Manager):
    def create_invite(self, email, team, level, creator) -> "Invite":
        user = MyUser.objects.filter(email=email).first()
        if not user:
            user = MyUser.objects.create_user(email=email)
        m = Membership.objects.create(
            user=user, team=team, level=level, is_active=False
        )
        return cast(Invite, self.model.objects.create(membership=m, creator=creator))


class Invite(CommonInfo):
    membership = models.OneToOneField("Membership", on_delete=models.CASCADE)
    creator = models.ForeignKey(MyUser, on_delete=models.CASCADE)

    OPEN = "open"
    DECLINED = "declined"
    ACCEPTED = "accepted"

    INVITE_STATUS = ((OPEN, OPEN), (DECLINED, DECLINED), (ACCEPTED, ACCEPTED))

    status = models.CharField(max_length=11, choices=INVITE_STATUS, default=OPEN)

    objects = InviteManager()

    def __str__(self):
        return f"<Invite • Membership: {self.membership}>"

    @property
    def user(self):
        return self.membership.user

    @property
    def active(self):
        return self.membership.is_active

    @property
    def team(self):
        return self.membership.team

    def accept(self):
        self.membership.set_active()
        self.status = self.ACCEPTED
        self.save()

    def decline(self):
        self.status = self.DECLINED
        self.save()


class Team(CommonInfo):
    name = models.CharField(max_length=255)
    is_public = models.BooleanField(default=False)
    recipes = GenericRelation("Recipe", related_query_name="owner_team")

    def __str__(self):
        return f"<Team • name: {self.name}, is_public: {self.is_public}>"

    def force_join(
        self,
        user: MyUser,
        level: Literal["admin", "contributor", "read"] = "contributor",
    ) -> "Membership":
        with transaction.atomic():
            if level is None:
                level = Membership.CONTRIBUTOR
            m, created = Membership.objects.get_or_create(
                team=self, user=user, defaults={"level": level, "is_active": True}
            )
            if not created:
                m.level = level
                m.is_active = True
                m.save()
            # remove existing invite
            if user.has_invite(self):
                user.membership_set.exclude(invite=None).get(team=self).invite.delete()
            return m

    def force_join_admin(self, user: MyUser) -> "Membership":
        return self.force_join(user, level=Membership.ADMIN)

    def invite_user(self, user, creator, level=None) -> Invite:
        """
        Invite user to team

        Adds member to team with is_active=False. Creates associated Invite.
        """
        if level is None:
            level = Membership.CONTRIBUTOR
        return Invite.objects.create_invite(
            email=user.email, team=self, level=level, creator=creator
        )

    def kick_user(self, user):
        """
        Remove user from team. If they have an invite, remove it as well.
        """
        membership = user.membership_set.get(team=self)
        # delete membership. By deleting, associated invites will be deleted.
        membership.delete()

    def set_public(self):
        self.is_public = True
        self.save()

    def set_private(self):
        self.is_public = False
        self.save()

    def admins(self):
        return self.membership_set.filter(is_active=True, level=Membership.ADMIN)

    def is_member(self, user) -> bool:
        return self.membership_set.filter(user=user, is_active=True).exists()

    def is_contributor(self, user) -> bool:
        return self.membership_set.filter(
            user=user, is_active=True, level=Membership.CONTRIBUTOR
        ).exists()

    def is_admin(self, user) -> bool:
        return self.membership_set.filter(
            user=user, is_active=True, level=Membership.ADMIN
        ).exists()

    def invite_exists(self, email: Union[MyUser, str]) -> bool:
        return Membership.objects.filter(team=self, user__email=email).exists()

    @property
    def scheduled_recipes(self):
        return ScheduledRecipe.objects.filter(team=self)


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


class RecipeChange(CommonInfo):
    """
    Record changes of a recipe. Useful for constructing a timeline of a
    recipe's evolution.
    """

    actor = models.ForeignKey(
        "MyUser", on_delete=models.CASCADE, help_text="User who made the change."
    )

    before = models.CharField(
        max_length=255,
        blank=True,
        help_text="The previous value, sometimes derived from multiple fields",
    )

    after = models.CharField(
        max_length=255,
        blank=False,
        help_text="The new value, sometimes derived from multiple fields",
    )

    change_type = models.CharField(
        choices=[(c.value, c.value) for c in ChangeType],
        max_length=255,
        help_text="The field / model changed.",
    )


class ShoppingList(CommonInfo):
    """
    Store a shoppinglist anytime we generate one.

    Useful for looking back at bad combines and similar parsing issues.
    """

    ingredients = JSONField()


class Membership(CommonInfo):
    ADMIN = "admin"
    CONTRIBUTOR = "contributor"
    READ_ONLY = "read"

    MEMBERSHIP_CHOICES = (
        (ADMIN, ADMIN),
        (CONTRIBUTOR, CONTRIBUTOR),
        (READ_ONLY, READ_ONLY),
    )

    level = models.CharField(
        max_length=11, choices=MEMBERSHIP_CHOICES, default=CONTRIBUTOR
    )

    team: Team = models.ForeignKey(Team, on_delete=models.CASCADE)
    user = models.ForeignKey(MyUser, on_delete=models.CASCADE)

    class Meta:
        unique_together = (("user", "team"),)

    # A user is activated once they accept their invite
    is_active = models.BooleanField(default=False)

    def set_active(self):
        self.is_active = True
        self.save()

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        if not is_new:
            # NOTE: although we check inside the serializer to prevent demoting the
            # last admin, this forms a last line of defence
            current = Membership.objects.get(pk=self.pk)
            one_admin_left = len(self.team.admins()) == 1
            demoting_admin = current.level == self.ADMIN and self.level != self.ADMIN
            if one_admin_left and demoting_admin:
                raise ValueError("cannot demote self as last admin")
        super().save(*args, **kwargs)

    def delete(self):
        last_member = self.team.membership_set.count() == 1
        if last_member:
            raise ValueError("cannot delete last member of team")
        super().delete()

    def __str__(self):
        return f"<Membership • user_email: {self.user.email}, team: {self.team.id} level: {self.level}>"


def user_active_team_ids(user):
    return user.membership_set.filter(is_active=True).values_list("team")


def user_and_team_recipes(user: MyUser):
    return Recipe.objects.filter(
        Q(owner_user=user) | Q(owner_team__in=user_active_team_ids(user))
    )
