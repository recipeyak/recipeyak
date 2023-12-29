from __future__ import annotations

from django.db.models import QuerySet
from django.shortcuts import get_object_or_404

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.api.team_update_view import is_team_admin
from recipeyak.models import Membership, Team, get_team_by_id
from recipeyak.models.membership import DemoteLastAdminError
from recipeyak.models.user import User


def get_memberships(user: User) -> QuerySet[Membership]:
    memberships = Membership.objects.filter(
        team_id__in=Team.objects.filter(
            membership__user_id=user.id, membership__is_active=True
        )
    )
    return memberships.select_related("user").all()


@endpoint()
def member_delete_view(
    request: AuthedHttpRequest, *, team_id: int = -1, member_id: int
) -> JsonResponse:
    team = get_team_by_id(user_id=request.user.id, team_id=team_id)
    membership = get_object_or_404(get_memberships(request.user), pk=member_id)
    if (
        not is_team_admin(team_id=team.id, user_id=request.user.id)
        and membership.user != request.user
    ):
        return JsonResponse(status=403)
    try:
        membership.delete()
    except DemoteLastAdminError as e:
        return JsonResponse(str(e), status=400)
    return JsonResponse(status=204)
