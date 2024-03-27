from __future__ import annotations

import pydantic
from django.contrib.auth import logout

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest


class UserLogoutResponse(pydantic.BaseModel):
    detail: str


@endpoint()
def user_logout_view(request: AuthedHttpRequest, params: None) -> UserLogoutResponse:
    """
    Calls Django logout method and logs out current User object.

    Accepts/Returns nothing.
    """
    logout(request)

    return UserLogoutResponse(detail="Successfully logged out.")
