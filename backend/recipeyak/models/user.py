from __future__ import annotations

import hashlib
import logging
from typing import TYPE_CHECKING

from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
)
from django.contrib.postgres.fields import CIEmailField
from django.db import models, transaction

from recipeyak.models.membership import Membership
from recipeyak.models.upload import public_url

if TYPE_CHECKING:
    from django.db.models.manager import RelatedManager
    from user_sessions.models import Session

    from recipeyak.models.scheduled_recipe import ScheduledRecipe
    from recipeyak.models.team import Team
    from recipeyak.models.upload import Upload  # noqa: F401

logger = logging.getLogger(__name__)


class UserManager(BaseUserManager["User"]):
    def create_user(self, email: str, password: str | None = None) -> User:
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


def get_avatar_url(*, email: str, profile_upload_key: str | None) -> str:
    if profile_upload_key is not None:
        return public_url(profile_upload_key)
    md5_email = hashlib.md5(email.encode("utf-8")).hexdigest()
    # indenticons by default `d=identicon`
    # Avatars with ratings of G only `r=g`
    # https://secure.gravatar.com/site/implement/images/
    return f"/avatar/{md5_email}?d=identicon&r=g"


class User(AbstractBaseUser):
    """Custom user model that only requires an email and password"""

    pk: int
    id = models.AutoField(primary_key=True)

    email = CIEmailField(unique=True)
    name = models.TextField(null=True)

    created = models.DateField(auto_now_add=True)
    last_updated = models.DateField(auto_now=True)

    theme_day = models.TextField(db_column="theme", default="light")
    theme_night = models.TextField(default="dark")
    theme_mode = models.TextField(default="single")

    # TODO: this shouldn't be null, need to update the data in prod first
    schedule_team = models.ForeignKey["Team"](
        "Team",
        null=True,
        blank=True,
        help_text="default team selected for scheduled view.",
        on_delete=models.SET_NULL,
        related_name="+",
    )
    schedule_team_id: int | None

    profile_upload = models.ForeignKey["Upload"](
        "Upload", related_name="+", on_delete=models.SET_NULL, null=True
    )
    profile_upload_id: int | None

    # required by django.contrib.auth
    USERNAME_FIELD = "email"

    objects = UserManager()

    class Meta:
        db_table = "core_myuser"

    def get_display_name(self) -> str:
        return self.name or self.email

    def has_invite(self, team: Team) -> bool:
        """
        Return if user has invite to team.
        """
        return (
            Membership.objects.filter(team=team, user=self)
            .exclude(invite=None)
            .exists()
        )

    scheduled_recipes: RelatedManager[ScheduledRecipe]
    membership_set: RelatedManager[Membership]
    session_set: RelatedManager[Session]
