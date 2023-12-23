from __future__ import annotations

from typing import Any

from django.contrib.auth import login
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from pydantic import root_validator, validator
from rest_framework import serializers, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response

from recipeyak.api.base.serialization import RequestParams
from recipeyak.api.serializers.user import UserSerializer
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
            raise serializers.ValidationError({"error": {"message": msg}})
        return email

    @root_validator
    def validate(cls, data: dict[str, Any]) -> dict[str, Any]:  # type: ignore[override]
        if data["password1"] != data["password2"]:
            raise serializers.ValidationError(
                {"error": {"message": "The two password fields didn't match."}}
            )
        return data


@api_view(["POST"])
@permission_classes([AllowAny])
def register_user_detail_view(request: Request) -> Response:
    params = RegisterUserDetailView.parse_obj(request.data)
    with transaction.atomic():
        team = Team.objects.create(name="Personal")
        user = User()
        user.email = params.email
        user.set_password(params.password1)
        user.schedule_team = team
        user.save()
        team.force_join_admin(user)

    login(request._request, user)

    return Response({"user": UserSerializer(user).data}, status=status.HTTP_201_CREATED)
