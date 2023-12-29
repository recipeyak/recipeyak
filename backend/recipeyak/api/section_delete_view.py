from __future__ import annotations

from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.permissions import has_recipe_access
from recipeyak.api.base.request import AuthedRequest
from recipeyak.models import ChangeType, RecipeChange, Section


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def section_delete_view(request: AuthedRequest, section_id: int) -> Response:
    section = get_object_or_404(Section, pk=section_id)
    recipe = section.recipe
    if not has_recipe_access(recipe=recipe, user=request.user):
        return Response(status=403)

    RecipeChange.objects.create(
        recipe=recipe,
        actor=request.user,
        before=section.title,
        after="",
        change_type=ChangeType.SECTION_DELETE,
    )

    section.delete()

    return Response(status=204)
