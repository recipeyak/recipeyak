from __future__ import annotations

from typing import Annotated

from django.contrib.auth import password_validation, update_session_auth_hash
from pydantic import Field

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.api.base.serialization import RequestParams


class PasswordChangeParams(RequestParams):
    old_password: Annotated[str, Field(max_length=128)]
    new_password1: Annotated[str, Field(max_length=128)]
    new_password2: Annotated[str, Field(max_length=128)]


@endpoint()
def user_password_update_view(request: AuthedHttpRequest) -> JsonResponse:
    """
    Calls Django Auth SetPasswordForm save method.

    Accepts the following POST parameters: new_password1, new_password2
    Returns the success/fail message.
    """
    params = PasswordChangeParams.parse_raw(request.body)
    user = request.user
    if not user.check_password(params.old_password):
        return JsonResponse(
            {
                "error": {
                    "code": "invalid_password",
                    "message": "incorrect current password provided",
                }
            },
            status=400,
        )
    if params.new_password1 != params.new_password2:
        return JsonResponse(
            {
                "error": {
                    "code": "mismatched_passwords",
                    "message": "passwords do not match",
                }
            },
            status=400,
        )
    password_validation.validate_password(params.new_password2, user)

    user.set_password(params.new_password1)
    user.save()
    update_session_auth_hash(request, user)

    return JsonResponse({"detail": "New password has been saved."})
