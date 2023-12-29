from __future__ import annotations

from typing import TYPE_CHECKING

import pydantic
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import (
    AnonymousHttpRequest,
)
from recipeyak.api.base.response import JsonResponse
from recipeyak.api.base.serialization import RequestParams
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
    email: str


class ResetPasswordViewResponse(pydantic.BaseModel):
    detail: str


@endpoint(auth_required=False)
def user_password_reset_view(request: AnonymousHttpRequest) -> JsonResponse:
    params = ResetPasswordViewParams.parse_raw(request.body)

    user = User.objects.filter(email=params.email).first()
    if user is None:
        return JsonResponse(
            {"error": {"message": "email not found"}},
            status=400,
        )

    token = default_token_generator.make_token(user)
    uid = urlsafe_base64_encode(str(user.pk).encode())
    send_mail(
        subject="Password reset for RecipeYak",
        message=f"""\
You're receiving this email because you requested a password reset for your user account at https://recipeyak.com.

Please go to the following page and choose a new password:
    https://recipeyak.com/password-reset/confirm/{uid}/{token}
""",
        from_email="app@recipeyak.com",
        recipient_list=[user.email],
    )

    return JsonResponse(ResetPasswordViewResponse(detail="email sent"))
