from __future__ import annotations

from typing import Optional

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.models import ChangeType, RecipeChange, Step, user_and_team_recipes
from core.recipes.serializers import serialize_step
from core.request import AuthedRequest
from core.serialization import RequestParams


class StepCreateParams(RequestParams):
    text: str
    position: Optional[float] = None


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def steps_list_view(request: AuthedRequest, recipe_pk: int) -> Response:
    params = StepCreateParams.parse_obj(request.data)
    recipe = get_object_or_404(user_and_team_recipes(request.user), pk=recipe_pk)

    # set a position if not provided. We must included deleted because they
    # still take up a position.
    last_ingredient = recipe.step_set.all_with_deleted().last()
    if params.position is None:
        if last_ingredient is not None:
            params.position = last_ingredient.position + 10.0
        else:
            params.position = 10.0

    step = Step(
        text=params.text,
        recipe=recipe,
    )
    if params.position is not None:
        step.position = params.position
    step.save()

    RecipeChange.objects.create(
        recipe=recipe,
        actor=request.user,
        before="",
        after=params.text,
        change_type=ChangeType.STEP_CREATE,
    )
    return Response(serialize_step(step), status=status.HTTP_201_CREATED)
