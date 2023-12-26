from __future__ import annotations

from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.cook_checklist_create_view import cook_checklist_create_view
from recipeyak.api.cook_checklist_get_view import cook_checklist_get_view


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def cook_checklist_view(request: AuthedRequest, recipe_pk: str) -> Response:
    if request.method == "GET":
        return cook_checklist_get_view(request, recipe_pk)
    if request.method == "POST":
        return cook_checklist_create_view(request, recipe_pk)
    raise MethodNotAllowed(request.method or "")
