from __future__ import annotations

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.auth.permissions import has_recipe_access
from core.models import ChangeType, Recipe, RecipeChange, Section
from core.recipes.serializers import SectionSerializer
from core.request import AuthedRequest

# arbitrary value to increment the max position value for when we add a new
# section
POSITION_INCREMENT = 10


def get_next_max_pos(*, recipe: Recipe) -> float:
    cur_max: float = max(
        # need to convert to list due to some weirdness with how the soft
        # delete mixin overrides the `.values_list()` method
        list(recipe.ingredients.values_list("position", flat=True))
        + list(recipe.section_set.values_list("position", flat=True))
    )
    return cur_max + POSITION_INCREMENT


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_section_view(request: AuthedRequest, recipe_pk: int) -> Response:
    recipe = get_object_or_404(Recipe, pk=recipe_pk)
    if not has_recipe_access(recipe=recipe, user=request.user):
        return Response(status=status.HTTP_403_FORBIDDEN)

    serializer = SectionSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    RecipeChange.objects.create(
        recipe=recipe,
        actor=request.user,
        before="",
        after=serializer.validated_data["title"],
        change_type=ChangeType.SECTION_CREATE,
    )

    position = serializer.validated_data.get(
        "position", get_next_max_pos(recipe=recipe)
    )

    serializer.save(recipe=recipe, position=position)

    return Response(serializer.data, status=status.HTTP_201_CREATED)


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


def update_section_view(request: AuthedRequest, section_pk: int) -> Response:
    section = get_object_or_404(Section, pk=section_pk)
    recipe = section.recipe
    if not has_recipe_access(recipe=section.recipe, user=request.user):
        return Response(status=status.HTTP_403_FORBIDDEN)

    serializer = SectionSerializer(section, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    RecipeChange.objects.create(
        recipe=recipe,
        actor=request.user,
        before=section.title,
        after=serializer.validated_data.get("title", ""),
        change_type=ChangeType.SECTION_UPDATE,
    )
    serializer.save(recipe=section.recipe)

    return Response(serializer.data)


@api_view(["PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def delete_or_update_section_view(request: AuthedRequest, section_pk: int) -> Response:
    if request.method == "PATCH":
        return update_section_view(request, section_pk)
    if request.method == "DELETE":
        return delete_section_view(request, section_pk)
    assert request.method is not None
    raise MethodNotAllowed(method=request.method)
