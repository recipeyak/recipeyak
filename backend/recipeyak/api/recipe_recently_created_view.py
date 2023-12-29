from __future__ import annotations

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.models import filter_recipes, get_team


@endpoint()
def recipe_recently_created_view(request: AuthedHttpRequest) -> JsonResponse:
    team = get_team(request.user)
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
    return JsonResponse(recipes)
