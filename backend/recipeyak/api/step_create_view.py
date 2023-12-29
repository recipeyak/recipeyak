from __future__ import annotations

from django.shortcuts import get_object_or_404

from recipeyak import ordering
from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.api.base.serialization import RequestParams, StrTrimmed
from recipeyak.api.serializers.recipe import serialize_step
from recipeyak.models import ChangeType, RecipeChange, Step, filter_recipes, get_team


class StepCreateParams(RequestParams):
    text: StrTrimmed
    position: StrTrimmed | None = None


@endpoint()
def step_create_view(request: AuthedHttpRequest, recipe_id: int) -> JsonResponse:
    params = StepCreateParams.parse_raw(request.body)
    team = get_team(request.user)
    recipe = get_object_or_404(filter_recipes(team=team), pk=recipe_id)

    step = Step(text=params.text, recipe=recipe)
    if params.position is not None:
        step.position = params.position
    else:
        last_step = recipe.steps.last()
        if last_step is not None:
            step.position = ordering.position_after(last_step.position)
        else:
            step.position = ordering.FIRST_POSITION
    step.save()

    RecipeChange.objects.create(
        recipe=recipe,
        actor=request.user,
        before="",
        after=params.text,
        change_type=ChangeType.STEP_CREATE,
    )
    return JsonResponse(serialize_step(step), status=201)
