from __future__ import annotations

from django.db import transaction
from django.shortcuts import get_object_or_404

from recipeyak import ordering
from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.exceptions import APIError
from recipeyak.api.base.permissions import has_recipe_access
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.serialization import Params
from recipeyak.api.serializers.recipe import SectionSerializer, serialize_section
from recipeyak.models import ChangeType, Recipe, RecipeChange, Section
from recipeyak.realtime import publish_recipe
from recipeyak.versioning import save_recipe_version


class SectionCreateParams(Params):
    position: str | None = None
    title: str
    recipe_id: int


@endpoint()
def section_create_view(
    request: AuthedHttpRequest, params: SectionCreateParams
) -> SectionSerializer:
    recipe = get_object_or_404(Recipe, pk=params.recipe_id)
    if not has_recipe_access(recipe=recipe, user=request.user):
        raise APIError(code="no_access", message="No access to recipe", status=403)

    with transaction.atomic():
        RecipeChange.objects.create(
            recipe=recipe,
            actor=request.user,
            before="",
            after=params.title,
            change_type=ChangeType.SECTION_CREATE,
        )

        section = Section(title=params.title, recipe=recipe)
        if params.position is not None:
            section.position = params.position
        else:
            last_section = recipe.section_set.last()
            last_ingredient = recipe.ingredient_set.last()
            last_item = last_section or last_ingredient
            if last_item is not None:
                section.position = ordering.position_after(last_item.position)
            else:
                section.position = ordering.FIRST_POSITION

        section.save()
        save_recipe_version(recipe_id=recipe.id, actor=request.user)

    publish_recipe(recipe_id=recipe.id, team_id=recipe.team_id)

    return serialize_section(section)
