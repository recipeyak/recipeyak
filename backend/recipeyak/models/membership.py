from typing import TYPE_CHECKING, Any, Literal

from django.db import models
from django.db.models.manager import Manager
from django.utils.crypto import get_random_string

from recipeyak.models.base import CommonInfo

if TYPE_CHECKING:
    from recipeyak.models.team import Team  # noqa: F401
    from recipeyak.models.user import User  # noqa: F401


def get_random_ical_id() -> str:
    return get_random_string(length=48)


class DemoteLastAdminError(Exception):
    ...


class Membership(CommonInfo):
    ADMIN: Literal["admin"] = "admin"
    CONTRIBUTOR: Literal["contributor"] = "contributor"
    READ_ONLY: Literal["read"] = "read"
    id: int

    MEMBERSHIP_CHOICES = (
        (ADMIN, ADMIN),
        (CONTRIBUTOR, CONTRIBUTOR),
        (READ_ONLY, READ_ONLY),
    )

    level = models.CharField(
        max_length=11, choices=MEMBERSHIP_CHOICES, default=CONTRIBUTOR
    )

    team = models.ForeignKey["Team"]("Team", on_delete=models.CASCADE)
    user = models.ForeignKey["User"]("User", on_delete=models.CASCADE)

    calendar_sync_enabled = models.BooleanField(
        default=False,
        help_text="When enabled, accept requests that have the valid secret key.",
    )
    calendar_secret_key = models.TextField(
        default=get_random_ical_id,
        help_text="Secret key used to construct the icalendar url.",
    )

    objects = Manager["Membership"]()

    class Meta:
        unique_together = (("user", "team"),)
        db_table = "core_membership"

    # A user is activated once they accept their invite
    is_active = models.BooleanField(default=False)

    def set_active(self) -> None:
        self.is_active = True
        self.save()

    def save(self, *args: Any, **kwargs: Any) -> None:
        is_new = self.pk is None
        if not is_new:
            # NOTE: although we check inside the serializer to prevent demoting the
            # last admin, this forms a last line of defence
            current = Membership.objects.get(pk=self.pk)
            one_admin_left = len(self.team.admins()) == 1
            demoting_admin = current.level == self.ADMIN and self.level != self.ADMIN
            if one_admin_left and demoting_admin:
                raise DemoteLastAdminError("cannot demote self as last admin")
        super().save(*args, **kwargs)

    def delete(self) -> None:  # type: ignore[override]
        last_member = self.team.membership_set.count() == 1
        if last_member:
            raise DemoteLastAdminError("cannot delete last member of team")
        super().delete()
