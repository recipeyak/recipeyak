from __future__ import annotations

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response

from recipeyak.api.base.permissions import has_recipe_access
from recipeyak.api.base.request import AuthedRequest
from recipeyak.models import ChangeType, RecipeChange, Section


def section_delete_view(request: AuthedRequest, section_pk: int) -> Response:
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
