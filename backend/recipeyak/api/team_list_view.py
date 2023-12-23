from __future__ import annotations

from datetime import datetime

from django.db import connection
from pydantic import BaseModel
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.serializers.team import TeamSerializer
from recipeyak.models.team import Team


class TeamResponse(BaseModel):
    id: int
    name: str
    created: datetime
    members: int


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
            TeamResponse(id=id, name=name, created=created, members=members)
            for id, name, created, members in teams_raw
        ]
        return Response(teams)
    elif request.method == "POST":
        serializer = TeamSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        team: Team = serializer.save()
        team.force_join_admin(request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    else:
        raise MethodNotAllowed(request.method or "")
