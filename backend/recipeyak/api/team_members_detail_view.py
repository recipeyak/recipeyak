from __future__ import annotations

from datetime import datetime
from typing import Literal

import pydantic
from django.db.models import QuerySet
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.base.serialization import RequestParams
from recipeyak.api.team_member_delete_view import team_member_delete_view
from recipeyak.api.team_member_update_view import team_member_update_view
from recipeyak.models import Membership, Team


def get_team_members(team: Team) -> QuerySet[Membership]:
    return team.membership_set.select_related("user").all()


class UserResponse(pydantic.BaseModel):
    id: int
    name: str | None
    avatar_url: str
    email: str


class TeamMemberResponse(pydantic.BaseModel):
    id: int
    created: datetime
    level: Literal["admin", "contributor", "read"]
    user: UserResponse


class UpdateMembershipParams(RequestParams):
    level: Literal["admin", "contributor", "read"]


@api_view(["PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def team_members_detail_view(request: AuthedRequest, team_pk: int, pk: str) -> Response:
    if request.method == "DELETE":
        return team_member_delete_view(request, team_pk, pk)
    elif request.method == "PATCH":
        return team_member_update_view(request, team_pk, pk)
    else:
        raise MethodNotAllowed(request.method or "")
