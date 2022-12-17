from threading import local

from django.http import HttpRequest


class State(local):
    """
    Storage for request state
    """

    request_id: str | None = None
    request: HttpRequest | None = None
