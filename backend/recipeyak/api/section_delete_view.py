from __future__ import annotations

from django.shortcuts import get_object_or_404

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.permissions import has_recipe_access
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.models import ChangeType, RecipeChange, Section
from recipeyak.realtime import publish_recipe


@endpoint()
def section_delete_view(request: AuthedHttpRequest, section_id: int) -> JsonResponse:
    section = get_object_or_404(Section, pk=section_id)
    recipe = section.recipe
    if not has_recipe_access(recipe=recipe, user=request.user):
        return JsonResponse(status=403)

    RecipeChange.objects.create(
        recipe=recipe,
        actor=request.user,
        before=section.title,
        after="",
        change_type=ChangeType.SECTION_DELETE,
    )

    section.delete()
    publish_recipe(recipe_id=recipe.id, team_id=recipe.team_id)

    return JsonResponse(status=204)
