from __future__ import annotations

from datetime import datetime
from typing import Literal

from django.db import connection, transaction
from pydantic import BaseModel
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.base.serialization import RequestParams
from recipeyak.models.invite import Invite
from recipeyak.models.team import Team


class ListTeamResponse(BaseModel):
    id: int
    name: str
    created: datetime
    members: int


class RetrieveTeamResponse(BaseModel):
    id: int
    name: str


class TeamCreateParams(RequestParams):
    name: str
    emails: list[str]
    level: Literal["admin", "contributor", "read"]


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def team_list_view(request: AuthedRequest) -> Response:
    if request.method == "GET":
        with connection.cursor() as cursor:
            cursor.execute(
                """
SELECT
    core_team.id,
    core_team.name,
    core_team.created,
    count(*) members
FROM
    core_membership
JOIN
    core_team on core_team.id = core_membership.team_id
WHERE
    team_id in (
        SELECT
            core_team.id FROM core_team
            JOIN core_membership ON core_membership.team_id = core_team.id
        WHERE
            core_membership.user_id = %(user_id)s
    )
GROUP BY
    1;
""",
                {"user_id": request.user.id},
            )
            teams_raw = cursor.fetchall()
        teams = [
            ListTeamResponse(id=id, name=name, created=created, members=members)
            for id, name, created, members in teams_raw
        ]
        return Response(teams)
    elif request.method == "POST":
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
    else:
        raise MethodNotAllowed(request.method or "")
