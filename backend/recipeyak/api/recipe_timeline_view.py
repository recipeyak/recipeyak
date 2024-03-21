from __future__ import annotations

from datetime import date

import pydantic
from django.shortcuts import get_object_or_404

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.exceptions import APIError
from recipeyak.api.base.permissions import has_recipe_access
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.api.base.serialization import RequestParams
from recipeyak.models import Recipe, ScheduledRecipe, User


class RecipeTimelineResponse(pydantic.BaseModel):
    id: int
    on: date


class RecipeTimelineParams(RequestParams):
    recipe_id: int


@endpoint()
def recipe_timline_view(
    request: AuthedHttpRequest, params: RecipeTimelineParams
) -> JsonResponse[list[RecipeTimelineResponse]]:
    user: User = request.user
    # TODO: we probably don't want to rely on this so we can support multiple
    # sessions with different teams for a given user.
    team = user.schedule_team

    recipe = get_object_or_404(Recipe, pk=params.recipe_id)

    if not has_recipe_access(recipe=recipe, user=user):
        raise APIError(code="no_access", message="No access to recipe", status=403)

    scheduled_recipes = ScheduledRecipe.objects.filter(team=team).filter(
        recipe=params.recipe_id
    )

    return JsonResponse(
        [RecipeTimelineResponse(id=s.id, on=s.on) for s in scheduled_recipes]
    )
