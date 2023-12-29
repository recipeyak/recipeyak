from __future__ import annotations

import pydantic
from django.db import transaction
from django.shortcuts import get_object_or_404

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.api.base.serialization import RequestParams
from recipeyak.api.team_delete_view import get_teams, is_team_admin


class UpdateTeamResponse(pydantic.BaseModel):
    id: int
    name: str


class UpdateTeamParams(RequestParams):
    name: str


@endpoint()
def team_update_view(request: AuthedHttpRequest, team_id: int) -> JsonResponse:
    team = get_object_or_404(get_teams(request.user), pk=team_id)
    if not is_team_admin(team_id=team.id, user_id=request.user.id):
        return JsonResponse(status=403)

    params = UpdateTeamParams.parse_raw(request.body)

    with transaction.atomic():
        team.name = params.name
        team.save()
        team.force_join_admin(request.user)

    return JsonResponse(UpdateTeamResponse(id=team.id, name=team.name))
