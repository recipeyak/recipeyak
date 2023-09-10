from __future__ import annotations

import logging
from datetime import date

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.permissions import IsTeamMember
from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.base.serialization import RequestParams
from recipeyak.api.calendar_list_view import get_scheduled_recipes
from recipeyak.api.calendar_serialization import serialize_scheduled_recipe
from recipeyak.models import ScheduleEvent
from recipeyak.realtime import publish_calendar_event, publish_calendar_event_deleted

logger = logging.getLogger(__name__)


class ScheduledRecipeUpdateParams(RequestParams):
    on: date | None


def calendar_detail_patch_view(
    request: AuthedRequest, team_pk: int, scheduled_recipe_id: int
) -> Response:
    params = ScheduledRecipeUpdateParams.parse_obj(request.data)
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


def calendar_detail_delete_view(
    request: AuthedRequest, team_pk: int, scheduled_recipe_id: int
) -> Response:
    get_scheduled_recipes(team_pk).filter(id=scheduled_recipe_id).delete()
    publish_calendar_event_deleted(team_id=team_pk)
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["PATCH", "DELETE"])
@permission_classes([IsAuthenticated, IsTeamMember])
def calendar_detail_view(request: AuthedRequest, team_pk: int, pk: int) -> Response:
    if request.method == "PATCH":
        return calendar_detail_patch_view(request, team_pk, pk)
    elif request.method == "DELETE":
        return calendar_detail_delete_view(request, team_pk, pk)
    raise MethodNotAllowed(request.method or "")
