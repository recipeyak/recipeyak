from __future__ import annotations

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.serializers.team import TeamSerializer
from recipeyak.api.team_detail_view import get_teams
from recipeyak.models.team import Team


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def team_list_view(request: AuthedRequest) -> Response:
    if request.method == "GET":
        teams = get_teams(request.user)
        serializer = TeamSerializer(teams, many=True)
        return Response(serializer.data)
    elif request.method == "POST":
        serializer = TeamSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        team: Team = serializer.save()
        team.force_join_admin(request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    else:
        raise MethodNotAllowed(request.method or "")
