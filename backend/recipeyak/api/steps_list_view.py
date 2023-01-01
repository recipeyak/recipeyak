from __future__ import annotations

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak import ordering
from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.base.serialization import RequestParams
from recipeyak.api.serializers.recipe import serialize_step
from recipeyak.models import ChangeType, RecipeChange, Step, filter_recipes, get_team


class StepCreateParams(RequestParams):
    text: str
    position: str | None = None


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def steps_list_view(request: AuthedRequest, recipe_pk: int) -> Response:
    params = StepCreateParams.parse_obj(request.data)
    team = get_team(request)
    recipe = get_object_or_404(filter_recipes(team=team), pk=recipe_pk)

    step = Step(text=params.text, recipe=recipe)
    if params.position is not None:
        step.position = params.position
    else:
        last_step = recipe.step_set.last()
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
    return Response(serialize_step(step), status=status.HTTP_201_CREATED)
