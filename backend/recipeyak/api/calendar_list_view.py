from __future__ import annotations

from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.permissions import IsTeamMember
from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.calendar_list_get_view import calendar_list_get_view
from recipeyak.api.scheduled_recipe_create import scheduled_recipe_create_view


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated, IsTeamMember])
def calendar_list_view(request: AuthedRequest, team_pk: int) -> Response:
    if request.method == "GET":
        return calendar_list_get_view(request, team_pk)
    elif request.method == "POST":
        return scheduled_recipe_create_view(request, team_pk)
    raise MethodNotAllowed(request.method or "")
