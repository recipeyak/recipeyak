from __future__ import annotations

from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.base.serialization import RequestParams, StrTrimmed
from recipeyak.api.step_delete_view import step_delete_view
from recipeyak.api.step_update_view import step_update_view


class StepPatchParams(RequestParams):
    text: StrTrimmed | None = None
    position: str | None = None


@api_view(["PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def steps_detail_view(
    request: AuthedRequest, step_pk: int, recipe_pk: object = None
) -> Response:
    if request.method == "PATCH":
        return step_update_view(request, step_pk)
    elif request.method == "DELETE":
        return step_delete_view(request, step_pk)
    else:
        raise MethodNotAllowed(request.method or "")
