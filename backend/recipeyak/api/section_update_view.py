from __future__ import annotations

from django.shortcuts import get_object_or_404

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.exceptions import APIError
from recipeyak.api.base.permissions import has_recipe_access
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.api.base.serialization import RequestParams
from recipeyak.api.serializers.recipe import SectionResponse, serialize_section
from recipeyak.models import ChangeType, RecipeChange, Section


class SectionUpdateParams(RequestParams):
    position: str | None = None
    title: str | None = None


@endpoint()
def section_update_view(
    request: AuthedHttpRequest[SectionUpdateParams], section_id: int
) -> JsonResponse[SectionResponse]:
    section = get_object_or_404(Section, pk=section_id)
    recipe = section.recipe
    if not has_recipe_access(recipe=section.recipe, user=request.user):
        raise APIError(code="no_access", message="No access to recipe", status=403)

    params = SectionUpdateParams.parse_raw(request.body)
    if params.title is not None:
        section.title = params.title
    if params.position is not None:
        section.position = params.position
    RecipeChange.objects.create(
        recipe=recipe,
        actor=request.user,
        before=section.title,
        after=params.title or "",
        change_type=ChangeType.SECTION_UPDATE,
    )
    section.save()

    return JsonResponse(serialize_section(section))
