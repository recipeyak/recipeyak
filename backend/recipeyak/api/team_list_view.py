from __future__ import annotations

from datetime import datetime

from django.db import connection
from pydantic import BaseModel

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse


class ListTeamResponse(BaseModel):
    id: int
    name: str
    created: datetime
    members: int


# TODO: rename func and module to team_list_view


@endpoint()
def team_list_view(
    request: AuthedHttpRequest[None]
) -> JsonResponse[list[ListTeamResponse]]:
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
    return JsonResponse(teams)
