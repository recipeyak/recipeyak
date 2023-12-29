from __future__ import annotations

import pydantic
from django.db.models import QuerySet
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.models import Team
from recipeyak.models.user import User


def get_teams(user: User) -> QuerySet[Team]:
    return Team.objects.filter(membership__user_id=user.id)


class RetrieveTeamResponse(pydantic.BaseModel):
    id: int
    name: str


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def team_retrieve_view(request: AuthedRequest, team_id: int) -> Response:
    team = get_object_or_404(get_teams(request.user), pk=team_id)
    return Response(RetrieveTeamResponse(id=team.id, name=team.name))
