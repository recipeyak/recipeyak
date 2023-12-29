from typing import Literal

import pydantic
from django.db import transaction

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.api.base.serialization import RequestParams
from recipeyak.models import Team
from recipeyak.models.invite import Invite


class CreateInviteSerializer(RequestParams):
    emails: list[str]
    level: Literal["admin", "contributor", "read"]


class CreateInviteResponse(pydantic.BaseModel):
    invite_ids: list[int]


@endpoint()
def invite_create_view(request: AuthedHttpRequest, team_id: int) -> JsonResponse:
    """
    for creating, we want: level, user_id
    for response, we want: id, user data, team
    We want id, user object, and team data response
    need to use to_representation or form_represenation
    """
    team = Team.objects.get(pk=team_id)
    params = CreateInviteSerializer.parse_raw(request.body)
    with transaction.atomic():
        invite_ids = list[int]()
        for email in params.emails:
            if email and not team.invite_exists(email):
                invite = Invite.objects.create_invite(
                    email=email, team=team, level=params.level, creator=request.user
                )
                invite_ids.append(invite.id)
    return JsonResponse(CreateInviteResponse(invite_ids=invite_ids), status=201)
