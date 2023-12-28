from __future__ import annotations

from datetime import datetime
from typing import Literal

import pydantic
from django.db.models import QuerySet
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.base.serialization import RequestParams
from recipeyak.models import Membership, Team
from recipeyak.models.membership import DemoteLastAdminError
from recipeyak.models.user import User, get_avatar_url


def get_memberships(user: User) -> QuerySet[Membership]:
    memberships = Membership.objects.filter(
        team_id__in=Team.objects.filter(
            membership__user_id=user.id, membership__is_active=True
        )
    )
    return memberships.select_related("user").all()


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


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def team_member_update_view(
    request: AuthedRequest, *, team_id: int = -1, member_id: int
) -> Response:
    params = UpdateMembershipParams.parse_obj(request.data)
    membership = get_object_or_404(get_memberships(request.user), pk=member_id)
    membership.level = params.level
    try:
        membership.save()
    except DemoteLastAdminError as e:
        return Response(str(e), status=status.HTTP_400_BAD_REQUEST)

    return Response(
        TeamMemberResponse(
            id=membership.id,
            level=membership.level,
            created=membership.created,
            user=UserResponse(
                id=membership.user.id,
                name=membership.user.name,
                avatar_url=get_avatar_url(membership.user.email),
                email=membership.user.email,
            ),
        )
    )
