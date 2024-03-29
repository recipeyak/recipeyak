from __future__ import annotations

import pydantic
from django.db import transaction
from django.shortcuts import get_object_or_404

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.exceptions import APIError
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.serialization import Params
from recipeyak.api.team_delete_view import get_teams, is_team_admin


class TeamUpdateResponse(pydantic.BaseModel):
    id: int
    name: str


class TeamUpdateParams(Params):
    team_id: int
    name: str


@endpoint()
def team_update_view(
    request: AuthedHttpRequest, params: TeamUpdateParams
) -> TeamUpdateResponse:
    team = get_object_or_404(get_teams(request.user), pk=params.team_id)
    if not is_team_admin(team_id=team.id, user_id=request.user.id):
        raise APIError(
            code="insufficent_permissions",
            message="Must be a team admin for updates.",
            status=403,
        )

    with transaction.atomic():
        team.name = params.name
        team.save()
        team.force_join_admin(request.user)

    return TeamUpdateResponse(id=team.id, name=team.name)
