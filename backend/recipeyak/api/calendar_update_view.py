from datetime import date

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.api.base.serialization import RequestParams
from recipeyak.api.calendar_list_view import get_scheduled_recipes
from recipeyak.api.calendar_serialization import serialize_scheduled_recipe
from recipeyak.models import ScheduleEvent, get_team
from recipeyak.realtime import publish_calendar_event


class ScheduledRecipeUpdateParams(RequestParams):
    on: date | None


@endpoint()
def calendar_update_view(
    request: AuthedHttpRequest, scheduled_recipe_id: int, team_id: object = ()
) -> JsonResponse:
    params = ScheduledRecipeUpdateParams.parse_raw(request.body)
    team_id = get_team(request.user).id
    scheduled_recipe = get_scheduled_recipes(team_id).get(id=scheduled_recipe_id)
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
        scheduled_recipe, user_id=(request.user.id), team_id=(team_id)
    )

    publish_calendar_event(res, team_id)

    return JsonResponse(res)
