from django.contrib.auth.models import AnonymousUser
from django.http import HttpRequest

from recipeyak.models import User


class AuthedHttpRequest(HttpRequest):
    # narrower than HttpRequest.user, which is what makes this class useful
    user: User  # type: ignore[assignment]


class AnonymousHttpRequest(HttpRequest):
    user: AnonymousUser | User  # type: ignore[assignment]
