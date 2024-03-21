from __future__ import annotations

from django.db import transaction
from django.shortcuts import get_object_or_404

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.exceptions import APIError
from recipeyak.api.base.permissions import has_recipe_access
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.api.base.serialization import RequestParams
from recipeyak.models import ChangeType, RecipeChange, Section
from recipeyak.realtime import publish_recipe
from recipeyak.versioning import save_recipe_version


class SectionDeleteParams(RequestParams):
    section_id: int


@endpoint()
def section_delete_view(
    request: AuthedHttpRequest, params: SectionDeleteParams
) -> JsonResponse[None]:
    section = get_object_or_404(Section, pk=params.section_id)
    recipe = section.recipe
    if not has_recipe_access(recipe=recipe, user=request.user):
        raise APIError(
            code="forbidden", message="You cannot delete this section.", status=403
        )

    with transaction.atomic():
        RecipeChange.objects.create(
            recipe=recipe,
            actor=request.user,
            before=section.title,
            after="",
            change_type=ChangeType.SECTION_DELETE,
        )
        section.delete()
        save_recipe_version(recipe_id=recipe.id, actor=request.user)

    publish_recipe(recipe_id=recipe.id, team_id=recipe.team_id)

    return JsonResponse(None, status=204)
