from __future__ import annotations

from django.db import transaction
from django.db.models import QuerySet
from django.shortcuts import get_object_or_404

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.exceptions import APIError
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.api.base.serialization import Params
from recipeyak.models import Team
from recipeyak.models.membership import Membership
from recipeyak.models.user import User


def get_teams(user: User) -> QuerySet[Team]:
    return Team.objects.filter(membership__user_id=user.id)


def is_team_admin(*, team_id: int, user_id: int) -> bool:
    return Membership.objects.filter(
        team_id=team_id, user_id=user_id, level=Membership.ADMIN
    ).exists()


class TeamDeleteParams(Params):
    team_id: int


@endpoint()
def team_delete_view(
    request: AuthedHttpRequest, params: TeamDeleteParams
) -> JsonResponse[None]:
    with transaction.atomic():
        team = get_object_or_404(get_teams(request.user), pk=params.team_id)
        if (
            not is_team_admin(team_id=team.id, user_id=request.user.id)
            # don't allow deleting last team
            or get_teams(request.user).count() <= 1
        ):
            raise APIError(
                code="forbidden", message="You cannot delete this team.", status=403
            )
        team.delete()
        return JsonResponse(None, status=204)
