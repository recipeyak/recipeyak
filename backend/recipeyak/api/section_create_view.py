from __future__ import annotations

from django.shortcuts import get_object_or_404

from recipeyak import ordering
from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.permissions import has_recipe_access
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.api.base.serialization import RequestParams
from recipeyak.api.serializers.recipe import serialize_section
from recipeyak.models import ChangeType, Recipe, RecipeChange, Section


class SectionCreateParams(RequestParams):
    position: str | None = None
    title: str


@endpoint()
def section_create_view(request: AuthedHttpRequest, recipe_id: int) -> JsonResponse:
    recipe = get_object_or_404(Recipe, pk=recipe_id)
    if not has_recipe_access(recipe=recipe, user=request.user):
        return JsonResponse(status=403)

    params = SectionCreateParams.parse_raw(request.body)

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

    return JsonResponse(serialize_section(section), status=201)
