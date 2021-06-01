from rest_framework.request import Request

from core.models import User


class AuthedRequest(Request):
    user: User
