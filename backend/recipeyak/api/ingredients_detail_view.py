from __future__ import annotations

from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.ingredient_delete_view import ingredient_delete_view
from recipeyak.api.ingredient_update_view import ingredient_update_view


@api_view(["PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def ingredients_detail_view(
    request: AuthedRequest, ingredient_pk: int, recipe_pk: object = None
) -> Response:
    if request.method == "PATCH":
        return ingredient_update_view(request, ingredient_pk)
    elif request.method == "DELETE":
        return ingredient_delete_view(request, ingredient_pk)
    raise MethodNotAllowed(request.method or "")
