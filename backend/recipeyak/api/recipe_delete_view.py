from __future__ import annotations

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.models import (
    filter_recipe_or_404,
    get_team,
)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def recipe_delete_view(request: AuthedRequest, recipe_id: str) -> Response:
    team = get_team(request.user)
    recipe = filter_recipe_or_404(team=team, recipe_id=recipe_id)
    recipe.delete()
    return Response(status=204)
