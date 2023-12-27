from __future__ import annotations

from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.recipe_delete_view import recipe_delete_view
from recipeyak.api.recipe_get_view import recipe_get_view
from recipeyak.api.recipe_update_view import recipe_update_view


@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def receipe_detail_view(request: AuthedRequest, recipe_pk: str) -> Response:
    if request.method == "GET":
        return recipe_get_view(request, recipe_pk)
    elif request.method == "PATCH":
        return recipe_update_view(request, recipe_pk)
    elif request.method == "DELETE":
        return recipe_delete_view(request, recipe_pk)
    raise MethodNotAllowed(request.method or "")
