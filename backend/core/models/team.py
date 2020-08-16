from __future__ import annotations

from typing import TYPE_CHECKING, Union

from django.contrib.contenttypes.fields import GenericRelation
from django.db import models, transaction
from typing_extensions import Literal

from core.models.base import CommonInfo
from core.models.invite import Invite
from core.models.membership import Membership, get_random_ical_id
from core.models.scheduled_recipe import ScheduledRecipe

if TYPE_CHECKING:
    from core.models.my_user import MyUser


class Team(CommonInfo):
    name = models.CharField(max_length=255)
    is_public = models.BooleanField(default=False)
    recipes = GenericRelation("Recipe", related_query_name="owner_team")
    # deprecated
    ical_id = models.TextField(
        default=get_random_ical_id,
        help_text="Secret key used to prevent unauthorized access to schedule calendar.",
    )

    def __str__(self):
        return f"<Team • name: {self.name}, is_public: {self.is_public}>"

    def force_join(
        self,
        user: MyUser,
        level: Literal["admin", "contributor", "read"] = "contributor",
    ) -> Membership:
        with transaction.atomic():
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

    def force_join_admin(self, user: MyUser) -> Membership:
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
        # TODO(sbdchd): this can probably be team.scheduled_recipes_set
        return ScheduledRecipe.objects.filter(team=self)
