from __future__ import annotations

from typing import TYPE_CHECKING

from django.contrib.auth import login
from django.utils.http import urlsafe_base64_decode

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import (
    AnonymousHttpRequest,
)
from recipeyak.api.base.response import JsonResponse
from recipeyak.api.base.serialization import RequestParams
from recipeyak.api.user_retrieve_view import serialize_user
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


class ResetPasswordViewParams(RequestParams):
    uid: str
    token: str
    new_password1: str
    new_password2: str


@endpoint(auth_required=False)
def user_password_reset_confirm_view(request: AnonymousHttpRequest) -> JsonResponse:
    params = ResetPasswordViewParams.parse_raw(request.body)

    user_id = urlsafe_base64_decode(params.uid)
    user = User.objects.filter(pk=user_id).first()
    if user is None:
        return JsonResponse(
            {"error": {"message": "Invalid token. Could not find user."}},
            status=400,
        )

    if not default_token_generator.check_token(user, token=params.token):
        return JsonResponse(
            {"error": {"message": "Invalid or expired token."}},
            status=400,
        )
    if params.new_password1 != params.new_password2:
        return JsonResponse(
            {"error": {"message": "Passwords don't match"}},
            status=400,
        )
    user.set_password(params.new_password1)
    user.save()
    login(request, user)

    return JsonResponse(serialize_user(user))
