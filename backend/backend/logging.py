from backend.request_state import State
from backend.utils import getattr_path


class UserInfoFilter:
    """
    Logging filter to set `user_id` on the logging record
    """

    DEFAULT_USER_ID = "none"

    def filter(self, record):
        record.user_id = getattr_path(State.request, "user.id") or self.DEFAULT_USER_ID
        record.selected_org_id = (
            getattr_path(State.request, "user.id") or self.DEFAULT_USER_ID
        )
        return True


class RequestIDFilter:
    """
    Logging filter to set `user_id` on the logging record
    """

    DEFAULT_REQUEST_ID = "none"

    def filter(self, record):
        record.request_id = State.request_id or self.DEFAULT_REQUEST_ID
        return True
