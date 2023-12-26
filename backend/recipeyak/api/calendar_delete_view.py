from __future__ import annotations

from rest_framework import status
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.calendar_list_get_view import get_scheduled_recipes
from recipeyak.models import get_team
from recipeyak.realtime import publish_calendar_event_deleted


def calendar_delete_view(request: AuthedRequest, scheduled_recipe_id: int) -> Response:
    team_pk = get_team(request).id
    get_scheduled_recipes(team_pk).filter(id=scheduled_recipe_id).delete()
    publish_calendar_event_deleted(recipe_id=scheduled_recipe_id, team_id=team_pk)
    return Response(status=status.HTTP_204_NO_CONTENT)
