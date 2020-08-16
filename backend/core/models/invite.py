from django.db import models

from core.models.base import CommonInfo
from core.models.membership import Membership
from core.models.my_user import MyUser


class InviteManager(models.Manager):
    def create_invite(self, email, team, level, creator) -> "Invite":
        user = MyUser.objects.filter(email=email).first()
        if not user:
            user = MyUser.objects.create_user(email=email)
        m = Membership.objects.create(
            user=user, team=team, level=level, is_active=False
        )
        return self.model.objects.create(membership=m, creator=creator)


class Invite(CommonInfo):
    membership = models.OneToOneField("Membership", on_delete=models.CASCADE)
    creator = models.ForeignKey("MyUser", on_delete=models.CASCADE)

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
