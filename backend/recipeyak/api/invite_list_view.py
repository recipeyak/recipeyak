from datetime import datetime
from typing import Literal

import pydantic
from django.db import connection
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.models.user import get_avatar_url


class TeamResponse(pydantic.BaseModel):
    id: int
    name: str


class CreatorResponse(pydantic.BaseModel):
    id: int
    email: str
    avatar_url: str


class InviteResponse(pydantic.BaseModel):
    id: int
    created: datetime
    status: Literal["accepted", "declined", "open"]
    team: TeamResponse
    creator: CreatorResponse


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def invite_list_view(request: AuthedRequest) -> Response:
    with connection.cursor() as cursor:
        cursor.execute(
            """
select
    i.id,
    i.created,
    i.status,
    m.team_id,
    t.name,
    m.user_id,
    u.email
from
    core_invite i
    join core_membership m on m.id = i.membership_id
    join core_team t on t.id = m.team_id
    join core_myuser u on u.id = m.user_id
where
    m.user_id = %(user_id)s;
            """,
            {"user_id": request.user.id},
        )
        invite_rows = cursor.fetchall()
        invites = [
            InviteResponse(
                id=invite_id,
                created=created,
                status=status,
                team=TeamResponse(id=team_id, name=team_name),
                creator=CreatorResponse(
                    id=user_id, email=user_email, avatar_url=get_avatar_url(user_email)
                ),
            )
            for (
                invite_id,
                created,
                status,
                team_id,
                team_name,
                user_id,
                user_email,
            ) in invite_rows
        ]
        return Response(invites)
