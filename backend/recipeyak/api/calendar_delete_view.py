from __future__ import annotations

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.calendar_list_view import get_scheduled_recipes
from recipeyak.models import get_team
from recipeyak.realtime import publish_calendar_event_deleted


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def calendar_delete_view(
    request: AuthedRequest, scheduled_recipe_id: int, team_id: object = ()
) -> Response:
    team_id = get_team(request).id
    get_scheduled_recipes(team_id).filter(id=scheduled_recipe_id).delete()
    publish_calendar_event_deleted(recipe_id=scheduled_recipe_id, team_id=team_id)
    return Response(status=status.HTTP_204_NO_CONTENT)
