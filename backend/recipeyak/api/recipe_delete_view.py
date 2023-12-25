from __future__ import annotations

from rest_framework import status
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.models import (
    filter_recipe_or_404,
    get_team,
)


def recipe_delete_view(request: AuthedRequest, recipe_pk: str) -> Response:
    team = get_team(request)
    recipe = filter_recipe_or_404(team=team, recipe_pk=recipe_pk)
    recipe.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
