from __future__ import annotations

from typing import TYPE_CHECKING

from django.contrib.auth import login
from django.utils.http import urlsafe_base64_decode

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.exceptions import APIError
from recipeyak.api.base.request import (
    AnonymousHttpRequest,
)
from recipeyak.api.base.serialization import Params
from recipeyak.api.user_retrieve_view import UserSerializer, serialize_user
from recipeyak.models.user import User

if TYPE_CHECKING:

    class default_token_generator:  # noqa: N801
        @staticmethod
        def make_token(user: User) -> str:
            ...

        @staticmethod
        def check_token(user: User, token: str) -> str:
            ...

else:
    from django.contrib.auth.tokens import default_token_generator


class UserPasswordResetConfirmParams(Params):
    uid: str
    token: str
    new_password1: str
    new_password2: str


@endpoint(auth_required=False)
def user_password_reset_confirm_view(
    request: AnonymousHttpRequest, params: UserPasswordResetConfirmParams
) -> UserSerializer:
    user_id = urlsafe_base64_decode(params.uid)
    user = User.objects.filter(pk=user_id).first()
    if user is None:
        raise APIError(
            code="invalid_token", message="Invalid token. Could not find user."
        )
    if not default_token_generator.check_token(user, token=params.token):
        raise APIError(
            code="invalid_or_expired_token",
            message="Invalid or expired token.",
        )
    if params.new_password1 != params.new_password2:
        raise APIError(
            code="passwords_mismatch",
            message="Passwords don't match",
        )
    user.set_password(params.new_password1)
    user.save()
    login(request, user)

    return serialize_user(user)
