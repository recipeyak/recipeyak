from __future__ import annotations

from datetime import datetime
from typing import Literal

import pydantic
from django.db import connection

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.api.base.serialization import Params
from recipeyak.models import get_team_by_id
from recipeyak.models.user import get_avatar_url


class UserResponse(pydantic.BaseModel):
    id: int
    name: str | None
    avatar_url: str
    email: str


class MemberListItem(pydantic.BaseModel):
    id: int
    created: datetime
    level: Literal["admin", "contributor", "read"]
    user: UserResponse


class MemberListParams(Params):
    team_id: int


@endpoint()
def member_list_view(
    request: AuthedHttpRequest, params: MemberListParams
) -> JsonResponse[list[MemberListItem]]:
    team = get_team_by_id(user_id=request.user.id, team_id=params.team_id)
    with connection.cursor() as cursor:
        cursor.execute(
            """
select
    m.id membership_id,
    m.created membership_created,
    m.level membership_level,
    u.id user_id,
    u.name user_name,
    u.email user_email,
    upload.key profile_upload_key
from
    core_membership m
    join core_myuser as u on u.id = m.user_id
    left join core_upload as upload on upload.id = u.profile_upload_id
where
    team_id = %(team_id)s;""",
            {
                "team_id": team.id,
            },
        )
        rows = cursor.fetchall()
    members = list[MemberListItem]()
    for (
        membership_id,
        membership_created,
        membership_level,
        user_id,
        user_name,
        user_email,
        profile_upload_key,
    ) in rows:
        avatar_url = get_avatar_url(
            email=user_email, profile_upload_key=profile_upload_key
        )
        user = UserResponse(
            id=user_id,
            name=user_name,
            avatar_url=avatar_url,
            email=user_email,
        )
        members.append(
            MemberListItem(
                id=membership_id,
                created=membership_created,
                level=membership_level,
                user=user,
            )
        )
    return JsonResponse(members)
