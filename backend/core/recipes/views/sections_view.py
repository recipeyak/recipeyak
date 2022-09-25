from __future__ import annotations

from typing import Optional

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core import ordering
from core.auth.permissions import has_recipe_access
from core.models import ChangeType, Recipe, RecipeChange, Section
from core.recipes.serializers import SectionSerializer
from core.request import AuthedRequest
from core.serialization import RequestParams


class SectionCreateParams(RequestParams):
    position: Optional[str] = None
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
        last_section = recipe.section_set.all_with_deleted().last()
        last_ingredient = recipe.ingredient_set.all_with_deleted().last()
        last_item = last_section or last_ingredient
        if last_item is not None:
            section.position = ordering.position_after(last_item.position)
        else:
            section.position = ordering.FIRST_POSITION

    section.save()

    return Response(SectionSerializer(section).data, status=status.HTTP_201_CREATED)


def delete_section_view(request: AuthedRequest, section_pk: int) -> Response:
    section = get_object_or_404(Section, pk=section_pk)
    recipe = section.recipe
    if not has_recipe_access(recipe=recipe, user=request.user):
        return Response(status=status.HTTP_403_FORBIDDEN)

    RecipeChange.objects.create(
        recipe=recipe,
        actor=request.user,
        before=section.title,
        after="",
        change_type=ChangeType.SECTION_DELETE,
    )

    section.delete()

    return Response(status=status.HTTP_204_NO_CONTENT)


class SectionUpdateParams(RequestParams):
    position: Optional[str] = None
    title: Optional[str] = None


def update_section_view(request: AuthedRequest, section_pk: int) -> Response:
    section = get_object_or_404(Section, pk=section_pk)
    recipe = section.recipe
    if not has_recipe_access(recipe=section.recipe, user=request.user):
        return Response(status=status.HTTP_403_FORBIDDEN)

    params = SectionCreateParams.parse_obj(request.data)
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

    return Response(SectionSerializer(section).data)


@api_view(["PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def delete_or_update_section_view(request: AuthedRequest, section_pk: int) -> Response:
    if request.method == "PATCH":
        return update_section_view(request, section_pk)
    if request.method == "DELETE":
        return delete_section_view(request, section_pk)
    assert request.method is not None
    raise MethodNotAllowed(method=request.method)
