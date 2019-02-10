from django.conf import settings
from backend.request_state import State


class TestingDisableFilter:
    """
    Disable logging if the TESTING environment variable is set.
    """

    def filter(self, record):
        return not settings.TESTING


class RequestIDFilter:
    """
    Logging filter to set `request_id` on the logging record
    """

    DEFAULT_REQUEST_ID = "none"

    def filter(self, record):
        record.request_id = State.request_id or self.DEFAULT_REQUEST_ID
        return True
