from typing import Literal, cast

import pydantic
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.models.user import User


class UserSerializer(pydantic.BaseModel):
    id: int
    name: str
    avatar_url: str
    email: str
    theme_day: Literal["light", "dark", "dark_dimmed", "autumn", "solarized"]
    theme_night: Literal["light", "dark", "dark_dimmed", "autumn", "solarized"]
    theme_mode: Literal["single", "sync_with_system"]
    schedule_team: int | None


def serialize_user(user: User) -> UserSerializer:
    name = user.name or user.email
    return UserSerializer(
        id=user.id,
        name=name,
        avatar_url=user.avatar_url,
        email=user.email,
        theme_day=cast(
            Literal["light", "dark", "dark_dimmed", "autumn", "solarized"],
            user.theme_day,
        ),
        theme_night=cast(
            Literal["light", "dark", "dark_dimmed", "autumn", "solarized"],
            user.theme_night,
        ),
        theme_mode=cast(Literal["single", "sync_with_system"], user.theme_mode),
        schedule_team=user.schedule_team_id,
    )


def user_get_view(request: AuthedRequest) -> Response:
    return Response(serialize_user(request.user))
