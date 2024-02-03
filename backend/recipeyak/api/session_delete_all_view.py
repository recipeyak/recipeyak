from __future__ import annotations

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse


@endpoint()
def session_delete_all_view(request: AuthedHttpRequest[None]) -> JsonResponse[None]:
    request.user.session_set.exclude(pk=request.session.session_key).delete()
    return JsonResponse(None, status=204)
