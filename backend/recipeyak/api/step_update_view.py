from __future__ import annotations

from typing import Annotated

from django.shortcuts import get_object_or_404
from pydantic import StringConstraints

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.api.base.serialization import RequestParams
from recipeyak.api.serializers.recipe import serialize_step
from recipeyak.models import ChangeType, RecipeChange, filter_steps, get_team
from recipeyak.realtime import publish_recipe


class StepPatchParams(RequestParams):
    text: Annotated[str, StringConstraints(strip_whitespace=True)] | None = None
    position: str | None = None


@endpoint()
def step_update_view(request: AuthedHttpRequest, step_id: int) -> JsonResponse:
    team = get_team(request.user)
    params = StepPatchParams.parse_raw(request.body)
    step = get_object_or_404(filter_steps(team=team), pk=step_id)
    before_text = step.text
    recipe = step.recipe

    if params.text is not None:
        step.text = params.text
    if params.position is not None:
        step.position = params.position

    step.save()
    publish_recipe(recipe_id=recipe.id, team_id=recipe.team_id)

    RecipeChange.objects.create(
        recipe=step.recipe,
        actor=request.user,
        before=before_text,
        after=step.text,
        change_type=ChangeType.STEP_UPDATE,
    )
    return JsonResponse(serialize_step(step))
