from __future__ import annotations

from django.db.models import QuerySet
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.team_update_view import is_team_admin
from recipeyak.models import Membership, Team
from recipeyak.models.membership import DemoteLastAdminError


def get_team_members(team: Team) -> QuerySet[Membership]:
    return team.membership_set.select_related("user").all()


def team_member_delete_view(request: AuthedRequest, team_pk: int, pk: str) -> Response:
    team = get_object_or_404(Team, pk=team_pk)
    membership = get_object_or_404(get_team_members(team), pk=pk)
    if not is_team_admin(team, request.user) and membership.user != request.user:
        return Response(status=403)
    try:
        membership.delete()
    except DemoteLastAdminError as e:
        return Response(str(e), status=status.HTTP_400_BAD_REQUEST)
    return Response(status=status.HTTP_204_NO_CONTENT)
