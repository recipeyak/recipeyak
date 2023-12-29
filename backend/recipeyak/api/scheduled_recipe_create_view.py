from __future__ import annotations

from datetime import date

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.base.serialization import RequestParams
from recipeyak.api.calendar_serialization import serialize_scheduled_recipe
from recipeyak.api.team_update_view import get_teams
from recipeyak.models import filter_recipes, get_team
from recipeyak.realtime import publish_calendar_event


class ScheduledRecipeCreateParams(RequestParams):
    recipe: int
    on: date


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def scheduled_recipe_create_view(
    request: AuthedRequest, team_id: object = ()
) -> Response:
    params = ScheduledRecipeCreateParams.parse_obj(request.data)

    team = get_team(request)

    recipe = get_object_or_404(filter_recipes(team=team), id=params.recipe)

    scheduled_recipe = recipe.schedule(
        on=params.on,
        user=request.user,
        team=get_object_or_404(get_teams(request.user), pk=team.id),
    )
    res = serialize_scheduled_recipe(
        scheduled_recipe, user_id=request.user.id, team_id=team.id
    )

    publish_calendar_event(res, team_id=team.id)
    return Response(
        res,
        status=status.HTTP_201_CREATED,
    )
