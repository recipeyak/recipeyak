from typing import Literal

import pydantic
from django.db import transaction
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.permissions import IsTeamMember
from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.base.serialization import RequestParams
from recipeyak.models import Team
from recipeyak.models.invite import Invite


class CreateInviteSerializer(RequestParams):
    emails: list[str]
    level: Literal["admin", "contributor", "read"]


class CreateInviteResponse(pydantic.BaseModel):
    invite_ids: list[int]


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsTeamMember])
def team_invite_list_view(request: AuthedRequest, team_pk: int) -> Response:
    """
    for creating, we want: level, user_id
    for response, we want: id, user data, team
    We want id, user object, and team data response
    need to use to_representation or form_represenation
    """
    team = Team.objects.get(pk=team_pk)
    params = CreateInviteSerializer.parse_obj(request.data)
    with transaction.atomic():
        invite_ids = list[int]()
        for email in params.emails:
            if email and not team.invite_exists(email):
                invite = Invite.objects.create_invite(
                    email=email, team=team, level=params.level, creator=request.user
                )
                invite_ids.append(invite.id)
    return Response(
        CreateInviteResponse(invite_ids=invite_ids), status=status.HTTP_201_CREATED
    )
