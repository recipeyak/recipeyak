from __future__ import annotations

from typing import TYPE_CHECKING

from django.contrib.auth import login
from django.utils.http import urlsafe_base64_decode
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from recipeyak.api.base.request import AnonymousRequest
from recipeyak.api.base.serialization import RequestParams
from recipeyak.api.serializers.user import UserSerializer
from recipeyak.models.user import User

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
    uid: str
    token: str
    new_password1: str
    new_password2: str


@api_view(["POST"])
@permission_classes([AllowAny])
def password_reset_confirm_view(request: AnonymousRequest) -> Response:
    params = ResetPasswordViewParams.parse_obj(request.data)

    user_pk = urlsafe_base64_decode(params.uid)
    user = User.objects.filter(pk=user_pk).first()
    if user is None:
        raise ValidationError("Invalid token. Could not find user.")
    if not default_token_generator.check_token(user, token=params.token):
        raise ValidationError("Invalid or expired token.")
    if params.new_password1 != params.new_password2:
        raise ValidationError("Passwords don't match")
    user.set_password(params.new_password1)
    user.save()
    login(request, user)

    return Response(UserSerializer(user).data)
