from __future__ import annotations

from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.recipe_create_view import recipe_create_view
from recipeyak.api.recipe_list_get_view import recipe_list_get_view


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def recipe_list_view(request: AuthedRequest) -> Response:
    if request.method == "GET":
        return recipe_list_get_view(request)
    elif request.method == "POST":
        return recipe_create_view(request)
    raise MethodNotAllowed(request.method or "")
