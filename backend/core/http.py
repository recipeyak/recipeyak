from __future__ import annotations

from typing import Any

from advocate.adapters import ValidatingHTTPAdapter
from advocate.exceptions import MountDisabledException
from requests import Session as RequestsSession
from urllib3.util.retry import Retry


class SafeSession(RequestsSession):
    """
    Convenience wrapper around `requests.Session` set up for `advocate`ing
    """

    # taken from: https://github.com/JordanMilne/Advocate/blob/5f2ccc62c2d811bdf25ae8cf9e8b72b5490aa842/advocate/api.py#L42-L46
    # see: https://github.com/JordanMilne/Advocate/issues/21#issuecomment-1230774581

    # avoids us having to run something like Squid or https://github.com/stripe/smokescreen

    def __init__(self, max_retries: Retry | None = None) -> None:
        # `Session.__init__()` calls `mount()` internally, so we need to allow
        # it temporarily
        self.__mount_allowed = True
        RequestsSession.__init__(self)
        # Drop any existing adapters
        self.adapters = {}
        self.mount("http://", ValidatingHTTPAdapter(max_retries=max_retries))
        self.mount("https://", ValidatingHTTPAdapter(max_retries=max_retries))
        self.__mount_allowed = False

    def mount(self, *args: Any, **kwargs: Any) -> None:
        """Wrapper around `mount()` to prevent a protection bypass"""
        if self.__mount_allowed:
            super().mount(*args, **kwargs)
        else:
            raise MountDisabledException(
                "mount() is disabled to prevent protection bypasses"
            )
