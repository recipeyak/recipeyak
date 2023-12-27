from __future__ import annotations

from django.db import transaction
from django.db.models import QuerySet
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.models import Team
from recipeyak.models.membership import Membership
from recipeyak.models.user import User


def get_teams(user: User) -> QuerySet[Team]:
    return Team.objects.filter(membership__user_id=user.id)


def is_team_admin(team: Team, user: User) -> bool:
    return team.membership_set.filter(level=Membership.ADMIN).filter(user=user).exists()


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def team_delete_view(request: AuthedRequest, team_id: int) -> Response:
    with transaction.atomic():
        team = get_object_or_404(get_teams(request.user), pk=team_id)
        if (
            not is_team_admin(team, request.user)
            # don't allow deleting last team
            or get_teams(request.user).count() <= 1
        ):
            return Response(status=403)
        team.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
