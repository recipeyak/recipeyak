from __future__ import annotations

from typing import Any

from django.contrib.auth import login
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from pydantic import root_validator, validator

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AnonymousHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.api.base.serialization import RequestParams
from recipeyak.api.user_retrieve_view import serialize_user
from recipeyak.models.team import Team
from recipeyak.models.user import User


class RegisterUserDetailView(RequestParams):
    email: str
    password1: str
    password2: str

    @validator("password1")
    def validate_password1(cls, v: str) -> str:
        validate_password(v)
        return v

    @validator("email")
    def validate_email(cls, email: str) -> str:
        if User.objects.filter(email=email).first() is not None:
            msg = f"An email/password account is already associated with { email }."
            raise ValueError(msg)
        return email

    @root_validator
    def validate(cls, data: dict[str, Any]) -> dict[str, Any]:  # type: ignore[override]
        if data["password1"] != data["password2"]:
            raise ValueError("The two password fields didn't match.")
        return data


@endpoint(auth_required=False)
def user_create_view(request: AnonymousHttpRequest) -> JsonResponse:
    params = RegisterUserDetailView.parse_raw(request.body)
    with transaction.atomic():
        team = Team.objects.create(name="Personal")
        user = User()
        user.email = params.email
        user.set_password(params.password1)
        user.schedule_team = team
        user.save()
        team.force_join_admin(user)

    login(request, user)

    return JsonResponse({"user": serialize_user(user)}, status=201)
