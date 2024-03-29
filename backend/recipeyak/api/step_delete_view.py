from __future__ import annotations

from django.db import transaction
from django.shortcuts import get_object_or_404

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.serialization import Params
from recipeyak.models import ChangeType, RecipeChange, filter_steps, get_team
from recipeyak.realtime import publish_recipe
from recipeyak.versioning import save_recipe_version


class StepDeleteParams(Params):
    step_id: int


@endpoint()
def step_delete_view(request: AuthedHttpRequest, params: StepDeleteParams) -> None:
    team = get_team(request.user)
    step = get_object_or_404(filter_steps(team=team), pk=params.step_id)
    recipe = step.recipe
    with transaction.atomic():
        RecipeChange.objects.create(
            recipe=step.recipe,
            actor=request.user,
            before=step.text,
            after="",
            change_type=ChangeType.STEP_DELETE,
        )
        step.delete()
        save_recipe_version(recipe_id=recipe.id, actor=request.user)
    publish_recipe(recipe_id=recipe.id, team_id=recipe.team_id)
