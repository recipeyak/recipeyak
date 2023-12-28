from __future__ import annotations

from datetime import date

import pydantic
from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.permissions import has_recipe_access
from recipeyak.api.base.request import AuthedRequest
from recipeyak.models import Recipe, ScheduledRecipe, User


class RecipeTimelineResponse(pydantic.BaseModel):
    id: int
    on: date


@api_view(["GET"])
@permission_classes((IsAuthenticated,))
def get_recipe_timeline(request: AuthedRequest, recipe_id: int) -> Response:
    user: User = request.user
    # TODO: we probably don't want to rely on this so we can support multiple
    # sessions with different teams for a given user.
    team = user.schedule_team

    recipe = get_object_or_404(Recipe, pk=recipe_id)

    if not has_recipe_access(recipe=recipe, user=user):
        return Response(status=status.HTTP_403_FORBIDDEN)

    scheduled_recipes = ScheduledRecipe.objects.filter(
        Q(team=team) | Q(user=user)
    ).filter(recipe=recipe_id)

    return Response(
        [RecipeTimelineResponse(id=s.id, on=s.on) for s in scheduled_recipes]
    )
