from __future__ import annotations

from django.shortcuts import get_object_or_404

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse


@endpoint()
def session_delete_view(request: AuthedHttpRequest, session_id: str) -> JsonResponse:
    get_object_or_404(request.user.session_set, pk=session_id).delete()
    return JsonResponse(status=204)
