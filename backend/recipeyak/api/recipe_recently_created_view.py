from __future__ import annotations

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.models import filter_recipes, get_team


@api_view(["GET"])
@permission_classes((IsAuthenticated,))
def recipe_recently_created_view(request: AuthedRequest) -> Response:
    team = get_team(request)
    recipes = [
        {
            "id": r.id,
            "name": r.name,
            "author": r.author,
            "archivedAt": r.archived_at,
            "primaryImage": {
                "id": r.primary_image.id,
                "url": r.primary_image.public_url(),
                "backgroundUrl": r.primary_image.background_url,
            }
            if r.primary_image is not None
            else None,
        }
        for r in filter_recipes(team=team).order_by("-created")[:6]
    ]
    return Response(recipes)
