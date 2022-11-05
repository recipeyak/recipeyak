from __future__ import annotations

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.api.request import AuthedRequest
from core.models import user_and_team_recipes


@api_view(["GET"])
@permission_classes((IsAuthenticated,))
def get_recently_created_recipes(request: AuthedRequest) -> Response:
    recipes = [
        {"id": r.id, "name": r.name}
        for r in user_and_team_recipes(user=request.user).order_by("-created")[:6]
    ]
    return Response(recipes)
