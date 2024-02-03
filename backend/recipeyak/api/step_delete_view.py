from __future__ import annotations

from typing import Annotated

from django.db import transaction
from django.shortcuts import get_object_or_404
from pydantic import StringConstraints

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.api.base.serialization import RequestParams
from recipeyak.models import ChangeType, RecipeChange, filter_steps, get_team


class StepPatchParams(RequestParams):
    text: Annotated[str, StringConstraints(strip_whitespace=True)] | None = None
    position: str | None = None


@endpoint()
def step_delete_view(
    request: AuthedHttpRequest[None], step_id: int
) -> JsonResponse[None]:
    team = get_team(request.user)
    step = get_object_or_404(filter_steps(team=team), pk=step_id)
    with transaction.atomic():
        RecipeChange.objects.create(
            recipe=step.recipe,
            actor=request.user,
            before=step.text,
            after="",
            change_type=ChangeType.STEP_DELETE,
        )
        step.delete()
    return JsonResponse(None, status=204)
