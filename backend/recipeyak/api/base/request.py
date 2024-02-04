from typing import Generic, TypeVar

from django.contrib.auth.models import AnonymousUser
from django.http import HttpRequest

from recipeyak.models import User

_T = TypeVar("_T")


class AuthedHttpRequest(HttpRequest, Generic[_T]):
    user: User


class AnonymousHttpRequest(HttpRequest, Generic[_T]):
    user: AnonymousUser | User
