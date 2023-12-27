from typing import Literal

from django.db import transaction
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.base.serialization import RequestParams
from recipeyak.api.user_get_view import serialize_user

THEMES = Literal["light", "autumn", "solarized", "dark", "dark_dimmed"]
THEME_MODE = Literal["single", "sync_with_system"]


class UserUpdatePayload(RequestParams):
    email: str | None = None
    name: str | None = None
    schedule_team: int | None = None
    theme_day: THEMES | None = None
    theme_night: THEMES | None = None
    theme_mode: THEME_MODE | None = None


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def user_patch_view(request: AuthedRequest) -> Response:
    params = UserUpdatePayload.parse_obj(request.data)

    with transaction.atomic():
        if params.schedule_team is not None:
            request.user.schedule_team_id = params.schedule_team
        if params.email is not None:
            request.user.email = params.email
        if params.name is not None:
            request.user.name = params.name
        if params.theme_day is not None:
            request.user.theme_day = params.theme_day
        if params.theme_night is not None:
            request.user.theme_night = params.theme_night
        if params.theme_mode is not None:
            request.user.theme_mode = params.theme_mode
        request.user.save()

    return Response(serialize_user(request.user))
