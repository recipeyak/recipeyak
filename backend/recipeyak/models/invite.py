from __future__ import annotations

from typing import TYPE_CHECKING

from django.db import models

from recipeyak.models.base import CommonInfo
from recipeyak.models.membership import Membership
from recipeyak.models.user import User

if TYPE_CHECKING:
    from recipeyak.models.team import Team


class InviteManager(models.Manager["Invite"]):
    def create_invite(
        self, email: str, team: Team, level: str, creator: User
    ) -> Invite:
        user = User.objects.filter(email=email).first()
        if not user:
            user = User.objects.create_user(email=email)
        m = Membership.objects.create(
            user=user, team=team, level=level, is_active=False
        )
        return self.model.objects.create(membership=m, creator=creator)


class Invite(CommonInfo):
    id: int
    membership = models.OneToOneField(Membership, on_delete=models.CASCADE)
    creator = models.ForeignKey(User, on_delete=models.CASCADE)

    OPEN = "open"
    DECLINED = "declined"
    ACCEPTED = "accepted"

    INVITE_STATUS = ((OPEN, OPEN), (DECLINED, DECLINED), (ACCEPTED, ACCEPTED))

    status = models.CharField(max_length=11, choices=INVITE_STATUS, default=OPEN)

    objects = InviteManager()

    class Meta:
        db_table = "core_invite"

    def __str__(self) -> str:
        return f"<Invite • Membership: {self.membership}>"

    @property
    def user(self) -> User:
        return self.membership.user

    @property
    def active(self) -> bool:
        return self.membership.is_active

    @property
    def team(self) -> Team:
        return self.membership.team

    def accept(self) -> None:
        self.membership.set_active()
        self.status = self.ACCEPTED
        self.save()

    def decline(self) -> None:
        self.status = self.DECLINED
        self.save()
