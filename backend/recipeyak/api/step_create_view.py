from __future__ import annotations

from typing import Annotated

from django.db import transaction
from django.shortcuts import get_object_or_404
from pydantic import StringConstraints

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.api.base.serialization import RequestParams
from recipeyak.api.serializers.recipe import StepResponse, serialize_step
from recipeyak.models import ChangeType, RecipeChange, Step, filter_recipes, get_team
from recipeyak.realtime import publish_recipe
from recipeyak.versioning import save_recipe_version


class StepCreateParams(RequestParams):
    text: Annotated[str, StringConstraints(strip_whitespace=True)]
    position: Annotated[str, StringConstraints(strip_whitespace=True)]


@endpoint()
def step_create_view(
    request: AuthedHttpRequest[StepCreateParams], recipe_id: int
) -> JsonResponse[StepResponse]:
    params = StepCreateParams.parse_raw(request.body)
    team = get_team(request.user)
    recipe = get_object_or_404(filter_recipes(team=team), pk=recipe_id)

    with transaction.atomic():
        save_recipe_version(recipe, actor=request.user)
        step = Step.objects.create(
            text=params.text, recipe=recipe, position=params.position
        )
        RecipeChange.objects.create(
            recipe=recipe,
            actor=request.user,
            before="",
            after=params.text,
            change_type=ChangeType.STEP_CREATE,
        )

    publish_recipe(recipe_id=recipe.id, team_id=recipe.team_id)
    return JsonResponse(serialize_step(step), status=201)
