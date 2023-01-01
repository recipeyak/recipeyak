from __future__ import annotations

from django.db.models import QuerySet
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.permissions import IsTeamMember
from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.serializers.team import MembershipSerializer
from recipeyak.models import Membership, Team


def get_team_members(team: Team) -> QuerySet[Membership]:
    return team.membership_set.select_related("user").all()


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsTeamMember])
def team_members_list_view(request: AuthedRequest, team_pk: int) -> Response:
    if request.method == "GET":
        team = get_object_or_404(Team, pk=team_pk)
        members = get_team_members(team=team)
        serializer = MembershipSerializer(members, many=True)
        return Response(serializer.data)
    else:
        raise MethodNotAllowed(request.method or "")
