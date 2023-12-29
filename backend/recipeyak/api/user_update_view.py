from typing import Literal

from django.db import transaction

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.api.base.serialization import RequestParams
from recipeyak.api.user_retrieve_view import serialize_user

THEMES = Literal["light", "autumn", "solarized", "dark", "dark_dimmed"]
THEME_MODE = Literal["single", "sync_with_system"]


class UserUpdatePayload(RequestParams):
    email: str | None = None
    name: str | None = None
    schedule_team: int | None = None
    theme_day: THEMES | None = None
    theme_night: THEMES | None = None
    theme_mode: THEME_MODE | None = None


@endpoint()
def user_update_view(request: AuthedHttpRequest) -> JsonResponse:
    params = UserUpdatePayload.parse_raw(request.body)

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

    return JsonResponse(serialize_user(request.user))
