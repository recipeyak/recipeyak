from __future__ import annotations

from django.shortcuts import get_object_or_404

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.api.base.serialization import RequestParams, StrTrimmed
from recipeyak.api.serializers.recipe import serialize_step
from recipeyak.models import ChangeType, RecipeChange, filter_steps, get_team


class StepPatchParams(RequestParams):
    text: StrTrimmed | None = None
    position: str | None = None


@endpoint()
def step_update_view(
    request: AuthedHttpRequest, step_id: int, recipe_id: object = ()
) -> JsonResponse:
    team = get_team(request.user)
    params = StepPatchParams.parse_raw(request.body)
    step = get_object_or_404(filter_steps(team=team), pk=step_id)
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
    return JsonResponse(serialize_step(step))