from __future__ import annotations

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.permissions import IsTeamMember
from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.serializers.team import MembershipSerializer
from recipeyak.api.team_detail_view import is_team_admin
from recipeyak.api.team_members_list_view import get_team_members
from recipeyak.models import Team


@api_view(["PATCH", "DELETE"])
@permission_classes([IsAuthenticated, IsTeamMember])
def team_members_detail_view(request: AuthedRequest, team_pk: str, pk: str) -> Response:
    if request.method == "DELETE":
        team = get_object_or_404(Team, pk=team_pk)
        membership = get_object_or_404(get_team_members(team), pk=pk)
        if not is_team_admin(team, request.user) and membership.user != request.user:
            return Response(status=403)
        try:
            membership.delete()
        except ValueError as e:
            return Response(str(e), status=status.HTTP_400_BAD_REQUEST)
        return Response(status=status.HTTP_204_NO_CONTENT)
    elif request.method == "PATCH":
        team = get_object_or_404(Team, pk=team_pk)
        if not is_team_admin(team, request.user):
            return Response(status=403)
        membership = get_object_or_404(get_team_members(team), pk=pk)
        serializer = MembershipSerializer(membership, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        team = serializer.save()
        return Response(serializer.data)
    else:
        raise MethodNotAllowed(request.method or "")
