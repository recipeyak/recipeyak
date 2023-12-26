from __future__ import annotations

from django.shortcuts import get_object_or_404
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.base.serialization import RequestParams, StrTrimmed
from recipeyak.api.serializers.recipe import serialize_step
from recipeyak.models import ChangeType, RecipeChange, filter_steps, get_team


class StepPatchParams(RequestParams):
    text: StrTrimmed | None = None
    position: str | None = None


def step_update_view(request: AuthedRequest, step_pk: int) -> Response:
    team = get_team(request)
    params = StepPatchParams.parse_obj(request.data)
    step = get_object_or_404(filter_steps(team=team), pk=step_pk)
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
    return Response(serialize_step(step))
