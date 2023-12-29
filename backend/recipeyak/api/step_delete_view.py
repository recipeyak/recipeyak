from __future__ import annotations

from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.base.serialization import RequestParams, StrTrimmed
from recipeyak.models import ChangeType, RecipeChange, filter_steps, get_team


class StepPatchParams(RequestParams):
    text: StrTrimmed | None = None
    position: str | None = None


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def step_delete_view(
    request: AuthedRequest, step_id: int, recipe_id: object = ()
) -> Response:
    team = get_team(request.user)
    step = get_object_or_404(filter_steps(team=team), pk=step_id)
    RecipeChange.objects.create(
        recipe=step.recipe,
        actor=request.user,
        before=step.text,
        after="",
        change_type=ChangeType.STEP_DELETE,
    )
    step.delete()
    return Response(status=204)
