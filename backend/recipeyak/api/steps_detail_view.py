from __future__ import annotations

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.base.serialization import RequestParams, StrTrimmed
from recipeyak.api.serializers.recipe import serialize_step
from recipeyak.models import ChangeType, RecipeChange, filter_steps, get_team


class StepPatchParams(RequestParams):
    text: StrTrimmed | None = None
    position: str | None = None


@api_view(["PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def steps_detail_view(
    request: AuthedRequest, step_pk: int, recipe_pk: object = None
) -> Response:
    team = get_team(request)
    if request.method == "PATCH":
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
    if request.method == "DELETE":
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
    raise MethodNotAllowed(request.method or "")
