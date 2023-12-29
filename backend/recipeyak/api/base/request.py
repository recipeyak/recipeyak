from django.contrib.auth.models import AnonymousUser
from django.http import HttpRequest
from rest_framework.request import Request

from recipeyak.models import User


# TODO: switch to HttpRequest subclassing
class AuthedRequest(Request):
    user: User


class AnonymousRequest(Request):
    user: AnonymousUser


class AuthedHttpRequest(HttpRequest):
    user: User


class AnonymousHttpRequest(HttpRequest):
    user: AnonymousUser
