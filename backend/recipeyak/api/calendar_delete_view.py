from __future__ import annotations

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.serialization import Params
from recipeyak.api.calendar_list_view import get_scheduled_recipes
from recipeyak.models import get_team
from recipeyak.realtime import publish_calendar_event_deleted


class CalendarDeleteParams(Params):
    scheduled_recipe_id: int


@endpoint()
def calendar_delete_view(
    request: AuthedHttpRequest, params: CalendarDeleteParams
) -> None:
    team_id = get_team(request.user).id
    get_scheduled_recipes(team_id).filter(id=params.scheduled_recipe_id).delete()
    publish_calendar_event_deleted(
        recipe_id=params.scheduled_recipe_id, team_id=team_id
    )
