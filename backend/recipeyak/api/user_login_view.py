from __future__ import annotations

from typing import cast

import pydantic
from django.contrib.auth import authenticate, login
from pydantic import EmailStr

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.exceptions import APIError
from recipeyak.api.base.request import (
    AnonymousHttpRequest,
)
from recipeyak.api.base.serialization import Params
from recipeyak.api.user_retrieve_view import UserSerializer, serialize_user
from recipeyak.models.user import User


class UserLoginParams(Params):
    email: EmailStr
    password: str


class UserLoginResponse(pydantic.BaseModel):
    user: UserSerializer


@endpoint(auth_required=False)
def user_login_view(
    request: AnonymousHttpRequest, params: UserLoginParams
) -> UserLoginResponse:
    """
    Check the credentials and login if credentials are valid and authenticated.
    Calls Django Auth login method to register User ID in Django session framework.

    Accept the following POST parameters: username, password
    """
    user = authenticate(email=params.email, password=params.password)
    if not user:
        raise APIError(code="invalid_credentials", message="invalid email or password")

    login(request, user)

    return UserLoginResponse(user=serialize_user(cast(User, user)))
