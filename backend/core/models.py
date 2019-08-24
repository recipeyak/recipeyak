import hashlib
import logging
from typing import List, Optional

from allauth.socialaccount.models import EmailAddress
from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.contrib.postgres.fields import CIEmailField
from django.db import models, transaction

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

    def __str__(self):
        return self.email


class CommonInfo(models.Model):
    """Abstract model for storing common model info"""

    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Team(CommonInfo):
    name = models.CharField(max_length=255)
    is_public = models.BooleanField(default=False)

    def __str__(self):
        return f"<Team • name: {self.name}, is_public: {self.is_public}>"

    def force_join(self, user, level=None):
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
            return m

    def force_join_admin(self, user):
        return self.force_join(user, level=Membership.ADMIN)

    def is_member(self, user) -> bool:
        return self.membership_set.filter(user=user, is_active=True).exists()


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

    def __str__(self):
        return f"<Membership • user_email: {self.user.email}, team: {self.team.id} level: {self.level}>"
