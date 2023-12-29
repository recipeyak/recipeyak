from __future__ import annotations

from typing import cast

from django.contrib.auth import authenticate, login
from pydantic import EmailStr

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AnonymousHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.api.base.serialization import RequestParams
from recipeyak.api.user_retrieve_view import serialize_user
from recipeyak.models.user import User


class LoginUserParams(RequestParams):
    email: EmailStr
    password: str


@endpoint(dangerously_disable_auth_check=True)
def user_login_view(request: AnonymousHttpRequest) -> JsonResponse:
    """
    Check the credentials and login if credentials are valid and authenticated.
    Calls Django Auth login method to register User ID in Django session framework.

    Accept the following POST parameters: username, password
    """
    params = LoginUserParams.parse_raw(request.body)
    user = authenticate(email=params.email, password=params.password)
    if not user:
        return JsonResponse(
            {"non_field_errors": ["invalid email or password"]},
            status=400,
        )

    login(request, user)

    return JsonResponse({"user": serialize_user(cast(User, user))}, status=200)
