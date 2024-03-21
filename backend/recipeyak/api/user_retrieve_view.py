from typing import Literal, cast

import pydantic

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.models.user import User, get_avatar_url


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
        avatar_url=get_avatar_url(
            email=user.email,
            profile_upload_key=user.profile_upload.key
            if user.profile_upload is not None
            else None,
        ),
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


@endpoint()
def user_retrieve_view(
    request: AuthedHttpRequest, params: None
) -> JsonResponse[UserSerializer]:
    return JsonResponse(serialize_user(request.user))
