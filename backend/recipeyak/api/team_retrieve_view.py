from __future__ import annotations

import pydantic
from django.db.models import QuerySet
from django.shortcuts import get_object_or_404

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.api.base.serialization import Params
from recipeyak.models import Team
from recipeyak.models.user import User


def get_teams(user: User) -> QuerySet[Team]:
    return Team.objects.filter(membership__user_id=user.id)


class TeamRetrieveResponse(pydantic.BaseModel):
    id: int
    name: str


class TeamRetrieveParams(Params):
    team_id: int


@endpoint()
def team_retrieve_view(
    request: AuthedHttpRequest, params: TeamRetrieveParams
) -> JsonResponse[TeamRetrieveResponse]:
    team = get_object_or_404(get_teams(request.user), pk=params.team_id)
    return JsonResponse(TeamRetrieveResponse(id=team.id, name=team.name))
