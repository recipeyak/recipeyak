from __future__ import annotations

from datetime import datetime
from typing import Literal

import pydantic
from django.db.models import QuerySet
from django.shortcuts import get_object_or_404

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.api.base.serialization import RequestParams
from recipeyak.api.team_delete_view import is_team_admin
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


@endpoint()
def member_update_view(request: AuthedHttpRequest, *, member_id: int) -> JsonResponse:
    params = UpdateMembershipParams.parse_raw(request.body)
    membership = get_object_or_404(Membership, pk=member_id)
    if not is_team_admin(team_id=membership.team_id, user_id=request.user.id):
        return JsonResponse(
            {"error": "must be an admin to edit a membership level"}, status=403
        )
    membership.level = params.level
    try:
        membership.save()
    except DemoteLastAdminError as e:
        return JsonResponse(str(e), status=400)

    return JsonResponse(
        TeamMemberResponse(
            id=membership.id,
            level=membership.level,
            created=membership.created,
            user=UserResponse(
                id=membership.user.id,
                name=membership.user.name,
                avatar_url=get_avatar_url(
                    email=membership.user.email,
                    profile_upload_key=membership.user.profile_upload.key
                    if membership.user.profile_upload is not None
                    else None,
                ),
                email=membership.user.email,
            ),
        )
    )
