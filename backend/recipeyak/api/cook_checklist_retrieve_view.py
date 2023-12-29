from __future__ import annotations

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.models import (
    filter_cook_checklist,
    get_team,
)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def cook_checklist_retrieve_view(request: AuthedRequest, recipe_id: str) -> Response:
    team = get_team(request)
    recipe_checklist_items = filter_cook_checklist(team=team).filter(
        recipe_id=recipe_id
    )

    return Response(
        {x["ingredient_id"]: x["checked"] for x in recipe_checklist_items.values()}
    )
