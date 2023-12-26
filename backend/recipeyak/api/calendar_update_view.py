from datetime import date

from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.base.serialization import RequestParams
from recipeyak.api.calendar_list_get_view import get_scheduled_recipes
from recipeyak.api.calendar_serialization import serialize_scheduled_recipe
from recipeyak.models import ScheduleEvent, get_team
from recipeyak.realtime import publish_calendar_event


class ScheduledRecipeUpdateParams(RequestParams):
    on: date | None


def calendar_update_view(request: AuthedRequest, scheduled_recipe_id: int) -> Response:
    params = ScheduledRecipeUpdateParams.parse_obj(request.data)
    team_pk = get_team(request).id
    scheduled_recipe = get_scheduled_recipes(team_pk).get(id=scheduled_recipe_id)
    if params.on is not None:
        scheduled_recipe.on = params.on
    scheduled_recipe.save()

    if params.on is not None:
        ScheduleEvent.objects.create(
            scheduled_recipe_id=scheduled_recipe_id,
            before_on=scheduled_recipe.on,
            after_on=params.on,
            actor=request.user,
        )

    res = serialize_scheduled_recipe(
        scheduled_recipe, user_id=(request.user.id), team_id=(team_pk)
    )

    publish_calendar_event(res, team_pk)

    return Response(res)
