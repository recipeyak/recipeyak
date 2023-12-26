from __future__ import annotations

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.base.serialization import RequestParams, StrTrimmed
from recipeyak.models import ChangeType, RecipeChange, filter_steps, get_team


class StepPatchParams(RequestParams):
    text: StrTrimmed | None = None
    position: str | None = None


def step_delete_view(request: AuthedRequest, step_pk: int) -> Response:
    team = get_team(request)
    step = get_object_or_404(filter_steps(team=team), pk=step_pk)
    RecipeChange.objects.create(
        recipe=step.recipe,
        actor=request.user,
        before=step.text,
        after="",
        change_type=ChangeType.STEP_DELETE,
    )
    step.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
