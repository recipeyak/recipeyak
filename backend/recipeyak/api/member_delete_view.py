from __future__ import annotations

from django.db.models import QuerySet
from django.shortcuts import get_object_or_404

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
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


@endpoint()
def member_delete_view(request: AuthedHttpRequest, *, member_id: int) -> JsonResponse:
    """
    1. Admins of the team can edit any other member of the team
    2. Non-admins can edit themselves
    """
    membership = get_object_or_404(Membership, pk=member_id)
    # Must be part of the team
    if not is_team_member(user_id=request.user.id, team_id=membership.team_id):
        return JsonResponse({"error": "Not a member of the team"}, status=403)
    # To edit non-members, must be an admin
    if membership.user != request.user and not is_team_admin(
        team_id=membership.team_id, user_id=request.user.id
    ):
        return JsonResponse(
            {"error": "Must be an admin to edit another member"}, status=403
        )
    try:
        membership.delete()
    except DemoteLastAdminError as e:
        return JsonResponse(str(e), status=400)
    return JsonResponse(status=204)
