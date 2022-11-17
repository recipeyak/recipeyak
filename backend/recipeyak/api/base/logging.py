from typing import Any

from django.conf import settings

from recipeyak.api.base.request_state import State


class TestingDisableFilter:
    """
    Disable logging if the TESTING environment variable is set.
    """

    def filter(self, record: object) -> bool:
        return not settings.TESTING


class RequestIDFilter:
    """
    Logging filter to set `request_id` on the logging record
    """

    DEFAULT_REQUEST_ID = "none"

    def filter(self, record: Any) -> bool:
        record.request_id = State.request_id or self.DEFAULT_REQUEST_ID
        return True


class CurrentUserFilter:
    """
    Logging filter to set `user_id` on the logging record
    """

    DEFAULT_USER_ID = "none"

    def filter(self, record: Any) -> bool:
        user = getattr(State.request, "user", None)
        record.user_id = getattr(user, "id", None) or self.DEFAULT_USER_ID
        return True
