from __future__ import annotations

from django.db.models import QuerySet
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.team_update_view import is_team_admin
from recipeyak.models import Membership, Team, get_team_by_id
from recipeyak.models.membership import DemoteLastAdminError
from recipeyak.models.user import User


def get_memberships(user: User) -> QuerySet[Membership]:
    memberships = Membership.objects.filter(
        team_id__in=Team.objects.filter(
            membership__user_id=user.id, membership__is_active=True
        )
    )
    return memberships.select_related("user").all()


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def team_member_delete_view(
    request: AuthedRequest, *, team_id: int = -1, member_id: int
) -> Response:
    team = get_team_by_id(request=request, team_id=team_id)
    membership = get_object_or_404(get_memberships(request.user), pk=member_id)
    if not is_team_admin(team, request.user) and membership.user != request.user:
        return Response(status=403)
    try:
        membership.delete()
    except DemoteLastAdminError as e:
        return Response(str(e), status=status.HTTP_400_BAD_REQUEST)
    return Response(status=status.HTTP_204_NO_CONTENT)
