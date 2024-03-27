from typing import Literal

import pydantic
from django.db import transaction

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.serialization import Params
from recipeyak.models import Team
from recipeyak.models.invite import Invite


class InviteCreateParams(Params):
    emails: list[str]
    level: Literal["admin", "contributor", "read"]
    team_id: int


class InviteCreateResponse(pydantic.BaseModel):
    invite_ids: list[int]


@endpoint()
def invite_create_view(
    request: AuthedHttpRequest, params: InviteCreateParams
) -> InviteCreateResponse:
    """
    for creating, we want: level, user_id
    for response, we want: id, user data, team
    We want id, user object, and team data response
    need to use to_representation or form_represenation
    """
    team = Team.objects.get(pk=params.team_id)
    with transaction.atomic():
        invite_ids = list[int]()
        for email in params.emails:
            if email and not team.invite_exists(email):
                invite = Invite.objects.create_invite(
                    email=email, team=team, level=params.level, creator=request.user
                )
                invite_ids.append(invite.id)
    return InviteCreateResponse(invite_ids=invite_ids)
