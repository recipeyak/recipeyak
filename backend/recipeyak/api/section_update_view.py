from __future__ import annotations

from django.db import transaction
from django.shortcuts import get_object_or_404

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.exceptions import APIError
from recipeyak.api.base.permissions import has_recipe_access
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.serialization import Params
from recipeyak.api.serializers.recipe import SectionSerializer, serialize_section
from recipeyak.models import ChangeType, RecipeChange, Section
from recipeyak.realtime import publish_recipe
from recipeyak.versioning import save_recipe_version


class SectionUpdateParams(Params):
    position: str | None = None
    title: str | None = None
    section_id: int


@endpoint()
def section_update_view(
    request: AuthedHttpRequest, params: SectionUpdateParams
) -> SectionSerializer:
    section = get_object_or_404(Section, pk=params.section_id)
    if not has_recipe_access(recipe=section.recipe, user=request.user):
        raise APIError(code="no_access", message="No access to recipe", status=403)

    with transaction.atomic():
        if params.title is not None:
            section.title = params.title
        if params.position is not None:
            section.position = params.position
        RecipeChange.objects.create(
            recipe=section.recipe,
            actor=request.user,
            before=section.title,
            after=params.title or "",
            change_type=ChangeType.SECTION_UPDATE,
        )
        section.save()
        save_recipe_version(recipe_id=section.recipe_id, actor=request.user)
    publish_recipe(recipe_id=section.recipe.id, team_id=section.recipe.team_id)

    return serialize_section(section)
