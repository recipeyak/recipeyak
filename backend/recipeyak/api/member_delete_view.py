from __future__ import annotations

from django.db.models import QuerySet
from django.shortcuts import get_object_or_404

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.exceptions import APIError
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.serialization import Params
from recipeyak.api.team_update_view import is_team_admin
from recipeyak.models import Membership, Team
from recipeyak.models.membership import DemoteLastAdminError
from recipeyak.models.user import User


def get_memberships(user: User) -> QuerySet[Membership]:
    memberships = Membership.objects.filter(
        team_id__in=Team.objects.filter(
            membership__user_id=user.id, membership__is_active=True
        )
    )
    return memberships.select_related("user").all()


def is_team_member(*, team_id: int, user_id: int) -> bool:
    return Membership.objects.filter(
        team_id=team_id, user_id=user_id, is_active=True
    ).exists()


class MemberDeleteParams(Params):
    member_id: int


@endpoint()
def member_delete_view(request: AuthedHttpRequest, params: MemberDeleteParams) -> None:
    """
    1. Admins of the team can edit any other member of the team
    2. Non-admins can edit themselves
    """
    membership = get_object_or_404(Membership, pk=params.member_id)
    # Must be part of the team
    if not is_team_member(user_id=request.user.id, team_id=membership.team_id):
        raise APIError(
            code="not_a_team_member",
            message="Not a member of the team",
            status=403,
        )
    # To edit non-members, must be an admin
    if membership.user != request.user and not is_team_admin(
        team_id=membership.team_id, user_id=request.user.id
    ):
        raise APIError(
            code="admin_required",
            message="Must be an admin to edit another member",
            status=403,
        )
    try:
        membership.delete()
    except DemoteLastAdminError as e:
        raise APIError(code="demote_last_admin", message=str(e)) from e
