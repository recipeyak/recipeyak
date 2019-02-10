from threading import local
from typing import Optional


class State(local):
    """
    Storage for request state
    """

    request_id: Optional[str] = None
