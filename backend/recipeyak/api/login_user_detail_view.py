from __future__ import annotations

from typing import Any

from django.contrib.auth import authenticate, login
from pydantic import EmailStr
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response

from recipeyak.api.base.serialization import RequestParams
from recipeyak.api.serializers.user import UserSerializer


class LoginUserParams(RequestParams):
    email: EmailStr
    password: str


@api_view(["POST"])
@permission_classes([AllowAny])
def login_user_detail_view(request: Request, *args: Any, **kwargs: Any) -> Response:
    """
    Check the credentials and login if credentials are valid and authenticated.
    Calls Django Auth login method to register User ID in Django session framework.

    Accept the following POST parameters: username, password
    """
    params = LoginUserParams.parse_obj(request.data)
    user = authenticate(email=params.email, password=params.password)
    if not user:
        return Response(
            {"non_field_errors": ["invalid email or password"]},
            status=status.HTTP_400_BAD_REQUEST,
        )

    login(request, user)

    return Response({"user": UserSerializer(user).data}, status=status.HTTP_200_OK)
