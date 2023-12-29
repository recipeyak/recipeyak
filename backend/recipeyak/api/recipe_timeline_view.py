from __future__ import annotations

from datetime import date

import pydantic
from django.db.models import Q
from django.shortcuts import get_object_or_404

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.permissions import has_recipe_access
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.models import Recipe, ScheduledRecipe, User


class RecipeTimelineResponse(pydantic.BaseModel):
    id: int
    on: date


@endpoint()
def recipe_timline_view(request: AuthedHttpRequest, recipe_id: int) -> JsonResponse:
    user: User = request.user
    # TODO: we probably don't want to rely on this so we can support multiple
    # sessions with different teams for a given user.
    team = user.schedule_team

    recipe = get_object_or_404(Recipe, pk=recipe_id)

    if not has_recipe_access(recipe=recipe, user=user):
        return JsonResponse(status=403)

    scheduled_recipes = ScheduledRecipe.objects.filter(
        Q(team=team) | Q(user=user)
    ).filter(recipe=recipe_id)

    return JsonResponse(
        [RecipeTimelineResponse(id=s.id, on=s.on) for s in scheduled_recipes]
    )
