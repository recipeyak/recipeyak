from __future__ import annotations

from django.shortcuts import get_object_or_404

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.api.base.serialization import Params


class SessionDeleteParams(Params):
    session_id: str


@endpoint()
def session_delete_view(
    request: AuthedHttpRequest, params: SessionDeleteParams
) -> JsonResponse[None]:
    get_object_or_404(request.user.session_set, pk=params.session_id).delete()
    return JsonResponse(None, status=204)
