from __future__ import annotations

from typing import Annotated

from django.contrib.auth import password_validation, update_session_auth_hash
from pydantic import Field
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.base.serialization import RequestParams


class PasswordChangeParams(RequestParams):
    old_password: Annotated[str, Field(max_length=128)]
    new_password1: Annotated[str, Field(max_length=128)]
    new_password2: Annotated[str, Field(max_length=128)]


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def password_change_detail_view(request: AuthedRequest) -> Response:
    """
    Calls Django Auth SetPasswordForm save method.

    Accepts the following POST parameters: new_password1, new_password2
    Returns the success/fail message.
    """
    params = PasswordChangeParams.parse_obj(request.data)
    user = request.user
    if not user.check_password(params.old_password):
        return Response(
            {
                "error": {
                    "code": "invalid_password",
                    "message": "incorrect current password provided",
                }
            },
            status=status.HTTP_400_BAD_REQUEST,
        )
    if params.new_password1 != params.new_password2:
        return Response(
            {
                "error": {
                    "code": "mismatched_passwords",
                    "message": "passwords do not match",
                }
            },
            status=status.HTTP_400_BAD_REQUEST,
        )
    password_validation.validate_password(params.new_password2, user)

    user.set_password(params.new_password1)
    user.save()
    update_session_auth_hash(request, user)

    return Response({"detail": "New password has been saved."})
