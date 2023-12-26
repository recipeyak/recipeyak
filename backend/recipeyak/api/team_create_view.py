from __future__ import annotations

from typing import Literal

from django.db import transaction
from pydantic import BaseModel
from rest_framework import status
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.base.serialization import RequestParams
from recipeyak.models.invite import Invite
from recipeyak.models.team import Team


class RetrieveTeamResponse(BaseModel):
    id: int
    name: str


class TeamCreateParams(RequestParams):
    name: str
    emails: list[str]
    level: Literal["admin", "contributor", "read"]


def team_create_view(request: AuthedRequest) -> Response:
    params = TeamCreateParams.parse_obj(request.data)
    with transaction.atomic():
        team = Team.objects.create(name=params.name)
        team.force_join_admin(request.user)
        for email in params.emails:
            Invite.objects.create_invite(
                email=email, team=team, level=params.level, creator=request.user
            )
    return Response(
        RetrieveTeamResponse(id=team.id, name=params.name),
        status=status.HTTP_201_CREATED,
    )
