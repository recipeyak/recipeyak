from threading import local
from typing import Optional

from django.http import HttpRequest
from .utils import getattr_path


class State(local):
    """
    Storage for request state
    """

    request: Optional[HttpRequest] = None
    request_id: Optional[str] = None

    @property
    def user_id(self) -> Optional[int]:
        return getattr_path(self.request, "user.id")
