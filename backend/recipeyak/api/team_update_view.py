from __future__ import annotations

import pydantic
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.base.serialization import RequestParams
from recipeyak.api.team_delete_view import get_teams, is_team_admin


class UpdateTeamResponse(pydantic.BaseModel):
    id: int
    name: str


class UpdateTeamParams(RequestParams):
    name: str


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def team_update_view(request: AuthedRequest, team_id: int) -> Response:
    team = get_object_or_404(get_teams(request.user), pk=team_id)
    if not is_team_admin(team_id=team.id, user_id=request.user.id):
        return Response(status=403)

    params = UpdateTeamParams.parse_obj(request.data)

    with transaction.atomic():
        team.name = params.name
        team.save()
        team.force_join_admin(request.user)

    return Response(UpdateTeamResponse(id=team.id, name=team.name))
