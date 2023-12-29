from django.contrib.auth.models import AnonymousUser
from django.http import HttpRequest

from recipeyak.models import User


class AuthedHttpRequest(HttpRequest):
    user: User


class AnonymousHttpRequest(HttpRequest):
    user: AnonymousUser | User
