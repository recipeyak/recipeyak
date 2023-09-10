import hashlib
import logging
from typing import TYPE_CHECKING

from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.contrib.contenttypes.fields import GenericRelation
from django.contrib.postgres.fields import CIEmailField
from django.db import models, transaction
from django.db.models.query import QuerySet
from user_sessions.models import Session

from recipeyak.models.membership import Membership
from recipeyak.models.scheduled_recipe import ScheduledRecipe

if TYPE_CHECKING:
    from recipeyak.models.team import Team

logger = logging.getLogger(__name__)


class UserManager(BaseUserManager["User"]):
    def create_user(self, email: str, password: str | None = None) -> "User":
        """
        Creates and saves a user with given email and password.
        """
        if not email:
            raise ValueError("User must have an email address")
        with transaction.atomic():
            user = self.model(email=self.normalize_email(email))
            user.set_password(password)
            user.save(using=self._db)
            logger.info("Created new user: %s", user)
            return user

    def create_superuser(self, email: str, password: str) -> "User":
        """
        Creates and saves a superuser with the given email and password.
        """
        user = self.create_user(email=email, password=password)
        user.is_admin = True
        user.is_superuser = True
        user.save(using=self._db)
        return user


def get_avatar_url(email: str) -> str:
    md5_email = hashlib.md5(email.encode("utf-8")).hexdigest()
    # indenticons by default `d=identicon`
    # Avatars with ratings of G only `r=g`
    # https://secure.gravatar.com/site/implement/images/
    return f"/avatar/{md5_email}?d=identicon&r=g"


class User(AbstractBaseUser, PermissionsMixin):
    """Custom user model that only requires an email and password"""

    id = models.AutoField(primary_key=True)

    email = CIEmailField(unique=True)
    name = models.TextField(null=True)

    # deprecated (previously used by Django Admin)
    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)

    created = models.DateField(auto_now_add=True)
    last_updated = models.DateField(auto_now=True)

    recipes = GenericRelation("Recipe", related_query_name="owner_user")

    theme = models.TextField(default="light")

    # deprecated
    _deprecated_dark_mode_enabled = models.BooleanField(
        default=False,
        help_text="frontend darkmode setting",
        db_column="dark_mode_enabled",
    )
    _deprecated_recipe_team = models.ForeignKey["Team"](
        "Team",
        null=True,
        db_column="selected_team_id",
        blank=True,
        help_text="team currently focused on UI, null if personal items selected.",
        on_delete=models.SET_NULL,
        related_name="+",
    )

    # TODO: this shouldn't be null
    schedule_team = models.ForeignKey["Team"](
        "Team",
        null=True,
        blank=True,
        help_text="default team selected for scheduled view.",
        on_delete=models.SET_NULL,
        related_name="+",
    )
    schedule_team_id: int | None

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS: list[str] = []

    objects = UserManager()

    class Meta:
        db_table = "core_myuser"
        constraints = [
            models.CheckConstraint(
                check=models.Q(theme__in=("light", "solarized", "autumn")),
                name="theme_is_valid",
            )
        ]

    def get_full_name(self) -> str:
        return self.email

    def get_short_name(self) -> str:
        return self.email

    def get_display_name(self) -> str:
        return self.name or self.email

    # deprecated
    # required for admin
    def has_perm(self, perm: object, obj: object = None) -> bool:
        """Does the user have a specific permission?"""
        # TODO: Add permissions
        return True

    # deprecated
    # required for admin
    def has_module_perms(self, app_label: object) -> bool:
        """Does the user have permissions to view the app `app_label`?"""
        # TODO: Add permissions
        return True

    def has_invite(self, team: "Team") -> bool:
        """
        Return if user has invite to team.
        """
        return (
            Membership.objects.filter(team=team, user=self)
            .exclude(invite=None)
            .exists()
        )

    def has_team(self) -> bool:
        return Membership.objects.filter(invite=None, user=self).exists()

    # deprecated
    # required for admin
    @property
    def is_staff(self) -> bool:
        return self.is_admin

    @property
    def avatar_url(self) -> str:
        return get_avatar_url(self.email)

    @property
    def scheduled_recipes(self) -> QuerySet[ScheduledRecipe]:
        # TODO(sbdchd): this can probably be user.scheduled_recipes_set
        return ScheduledRecipe.objects.filter(user=self)

    @property
    def membership_set(self) -> QuerySet["Membership"]:
        return Membership.objects.filter(user=self)

    @property
    def session_set(self) -> QuerySet["Session"]:
        return Session.objects.filter(user=self)

    def __str__(self) -> str:
        return self.email
