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
from recipeyak.models import ChangeType, RecipeChange, filter_steps, get_team
from recipeyak.realtime import publish_recipe
from recipeyak.versioning import save_recipe_version


class StepPatchParams(RequestParams):
    text: Annotated[str, StringConstraints(strip_whitespace=True)] | None = None
    position: str | None = None
    step_id: int


@endpoint()
def step_update_view(
    request: AuthedHttpRequest,
    params: StepPatchParams,
) -> JsonResponse[StepResponse]:
    team = get_team(request.user)
    step = get_object_or_404(filter_steps(team=team), pk=params.step_id)
    with transaction.atomic():
        before_text = step.text
        if params.text is not None:
            step.text = params.text
        if params.position is not None:
            step.position = params.position
        step.save()

        RecipeChange.objects.create(
            recipe=step.recipe,
            actor=request.user,
            before=before_text,
            after=step.text,
            change_type=ChangeType.STEP_UPDATE,
        )
        save_recipe_version(recipe_id=step.recipe_id, actor=request.user)

    publish_recipe(recipe_id=step.recipe.id, team_id=step.recipe.team_id)

    return JsonResponse(serialize_step(step))
