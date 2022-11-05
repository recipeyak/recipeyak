from __future__ import annotations

from typing import TYPE_CHECKING

import pydantic
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from core.api.request import AnonymousRequest
from core.api.serialization import RequestParams
from core.models.user import User

if TYPE_CHECKING:

    class default_token_generator:
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


@api_view(["POST"])
@permission_classes([AllowAny])
def password_reset_view(request: AnonymousRequest) -> Response:
    params = ResetPasswordViewParams.parse_obj(request.data)

    user = User.objects.filter(email=params.email).first()
    if user is None:
        raise ValidationError("email not found")

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

    return Response(ResetPasswordViewResponse(detail="email sent"))
