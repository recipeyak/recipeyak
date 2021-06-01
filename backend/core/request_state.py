from threading import local
from typing import Optional

from django.http import HttpRequest


class State(local):
    """
    Storage for request state
    """

    request_id: Optional[str] = None
    request: Optional[HttpRequest] = None
