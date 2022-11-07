from django.contrib.auth.models import AnonymousUser
from rest_framework.request import Request

from recipeyak.models import User


class AuthedRequest(Request):
    user: User


class AnonymousRequest(Request):
    user: AnonymousUser
