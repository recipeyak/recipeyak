from __future__ import annotations

import pydantic
from django.db import transaction
from django.db.models import QuerySet
from django.shortcuts import get_object_or_404
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.base.serialization import RequestParams
from recipeyak.models import Team
from recipeyak.models.membership import Membership
from recipeyak.models.user import User


def get_teams(user: User) -> QuerySet[Team]:
    return Team.objects.filter(membership__user_id=user.id)


def is_team_admin(team: Team, user: User) -> bool:
    return team.membership_set.filter(level=Membership.ADMIN).filter(user=user).exists()


class UpdateTeamResponse(pydantic.BaseModel):
    id: int
    name: str


class UpdateTeamParams(RequestParams):
    name: str


def team_update_view(request: AuthedRequest, team_pk: int) -> Response:
    team = get_object_or_404(get_teams(request.user), pk=team_pk)
    if not is_team_admin(team, request.user):
        return Response(status=403)

    params = UpdateTeamParams.parse_obj(request.data)

    with transaction.atomic():
        team.name = params.name
        team.save()
        team.force_join_admin(request.user)

    return Response(UpdateTeamResponse(id=team.id, name=team.name))
