from __future__ import annotations

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak import ordering
from recipeyak.api.base.permissions import has_recipe_access
from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.base.serialization import RequestParams
from recipeyak.api.serializers.recipe import serialize_section
from recipeyak.models import ChangeType, Recipe, RecipeChange, Section


class SectionCreateParams(RequestParams):
    position: str | None = None
    title: str


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_section_view(request: AuthedRequest, recipe_pk: int) -> Response:
    recipe = get_object_or_404(Recipe, pk=recipe_pk)
    if not has_recipe_access(recipe=recipe, user=request.user):
        return Response(status=status.HTTP_403_FORBIDDEN)

    params = SectionCreateParams.parse_obj(request.data)

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

    return Response(serialize_section(section), status=status.HTTP_201_CREATED)
