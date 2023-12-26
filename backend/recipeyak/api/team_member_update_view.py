from __future__ import annotations

from datetime import datetime
from typing import Literal

import pydantic
from django.db.models import QuerySet
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.base.serialization import RequestParams
from recipeyak.api.team_update_view import is_team_admin
from recipeyak.models import Membership, Team
from recipeyak.models.membership import DemoteLastAdminError
from recipeyak.models.user import get_avatar_url


def get_team_members(team: Team) -> QuerySet[Membership]:
    return team.membership_set.select_related("user").all()


class UserResponse(pydantic.BaseModel):
    id: int
    name: str | None
    avatar_url: str
    email: str


class TeamMemberResponse(pydantic.BaseModel):
    id: int
    created: datetime
    level: Literal["admin", "contributor", "read"]
    user: UserResponse


class UpdateMembershipParams(RequestParams):
    level: Literal["admin", "contributor", "read"]


def team_member_update_view(request: AuthedRequest, team_pk: int, pk: str) -> Response:
    team = get_object_or_404(Team, pk=team_pk)
    if not is_team_admin(team, request.user):
        return Response(status=403)
    params = UpdateMembershipParams.parse_obj(request.data)
    membership = get_object_or_404(get_team_members(team), pk=pk)
    membership.level = params.level
    try:
        membership.save()
    except DemoteLastAdminError as e:
        return Response(str(e), status=status.HTTP_400_BAD_REQUEST)

    return Response(
        TeamMemberResponse(
            id=membership.id,
            level=membership.level,
            created=membership.created,
            user=UserResponse(
                id=membership.user.id,
                name=membership.user.name,
                avatar_url=get_avatar_url(membership.user.email),
                email=membership.user.email,
            ),
        )
    )
