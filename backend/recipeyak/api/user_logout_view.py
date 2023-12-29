from __future__ import annotations

from django.contrib.auth import logout

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse


@endpoint()
def user_logout_view(request: AuthedHttpRequest) -> JsonResponse:
    """
    Calls Django logout method and logs out current User object.

    Accepts/Returns nothing.
    """
    logout(request)

    return JsonResponse({"detail": "Successfully logged out."}, status=200)
