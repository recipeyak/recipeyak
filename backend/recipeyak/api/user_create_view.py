from __future__ import annotations

from typing import Annotated

import pydantic
from django.contrib.auth import login
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from pydantic import AfterValidator, model_validator

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AnonymousHttpRequest
from recipeyak.api.base.serialization import Params
from recipeyak.api.user_retrieve_view import UserSerializer, serialize_user
from recipeyak.models.team import Team
from recipeyak.models.user import User


def _validate_email(email: str) -> str:
    if User.objects.filter(email=email).first() is not None:
        msg = f"An email/password account is already associated with { email }."
        raise ValueError(msg)
    return email


def _validate_password(password: str) -> str:
    validate_password(password)
    return password


class UserCreateParams(Params):
    email: Annotated[str, AfterValidator(_validate_email)]
    password1: Annotated[str, AfterValidator(_validate_password)]
    password2: str

    @model_validator(mode="after")
    def check_passwords_match(self) -> UserCreateParams:
        if self.password1 != self.password2:
            raise ValueError("The two password fields didn't match.")
        return self


class UserCreateResponse(pydantic.BaseModel):
    user: UserSerializer


@endpoint(auth_required=False)
def user_create_view(
    request: AnonymousHttpRequest, params: UserCreateParams
) -> UserCreateResponse:
    with transaction.atomic():
        team = Team.objects.create(name="Personal")
        user = User()
        user.email = params.email
        user.set_password(params.password1)
        user.schedule_team = team
        user.save()
        team.force_join_admin(user)

    login(request, user)

    return UserCreateResponse(user=serialize_user(user))
