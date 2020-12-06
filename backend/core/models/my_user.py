import hashlib
import logging
from typing import TYPE_CHECKING, List, Optional

from allauth.socialaccount.models import EmailAddress
from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.contrib.contenttypes.fields import GenericRelation
from django.contrib.postgres.fields import CIEmailField
from django.db import models, transaction
from django.db.models.query import QuerySet

from core.models.membership import Membership
from core.models.scheduled_recipe import ScheduledRecipe

if TYPE_CHECKING:
    from core.models.team import Team

logger = logging.getLogger(__name__)


class MyUserManager(BaseUserManager["MyUser"]):
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

    id = models.AutoField(primary_key=True)

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
    recipe_team = models.ForeignKey["Team"](
        "Team",
        null=True,
        db_column="selected_team_id",
        blank=True,
        help_text="team currently focused on UI, null if personal items selected.",
        on_delete=models.SET_NULL,
        related_name="+",
    )

    schedule_team = models.ForeignKey["Team"](
        "Team",
        null=True,
        blank=True,
        help_text="default team selected for scheduled view.",
        on_delete=models.SET_NULL,
        related_name="+",
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
        return (
            Membership.objects.filter(team=team, user=self)
            .exclude(invite=None)
            .exists()
        )

    def has_team(self) -> bool:
        return Membership.objects.filter(invite=None, user=self).exists()

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
        # TODO(sbdchd): this can probably be user.scheduled_recipes_set
        return ScheduledRecipe.objects.filter(user=self)

    @property
    def membership_set(self) -> QuerySet["Membership"]:
        return Membership.objects.filter(user=self)

    def __str__(self):
        return self.email
