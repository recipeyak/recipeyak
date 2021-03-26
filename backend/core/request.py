from rest_framework.request import Request

from core.models import MyUser


class AuthedRequest(Request):
    user: MyUser
