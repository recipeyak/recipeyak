from __future__ import annotations

from typing import Literal

from django.db import transaction
from pydantic import BaseModel

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
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


@endpoint()
def team_create_view(
    request: AuthedHttpRequest[TeamCreateParams]
) -> JsonResponse[RetrieveTeamResponse]:
    params = TeamCreateParams.parse_raw(request.body)
    with transaction.atomic():
        team = Team.objects.create(name=params.name)
        team.force_join_admin(request.user)
        for email in params.emails:
            Invite.objects.create_invite(
                email=email, team=team, level=params.level, creator=request.user
            )
    return JsonResponse(
        RetrieveTeamResponse(id=team.id, name=params.name),
        status=201,
    )
