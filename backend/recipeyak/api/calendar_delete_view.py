from __future__ import annotations

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.api.calendar_list_view import get_scheduled_recipes
from recipeyak.models import get_team
from recipeyak.realtime import publish_calendar_event_deleted


@endpoint()
def calendar_delete_view(
    request: AuthedHttpRequest, scheduled_recipe_id: int
) -> JsonResponse:
    team_id = get_team(request.user).id
    get_scheduled_recipes(team_id).filter(id=scheduled_recipe_id).delete()
    publish_calendar_event_deleted(recipe_id=scheduled_recipe_id, team_id=team_id)
    return JsonResponse(status=204)
