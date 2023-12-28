from typing import Any

import httpx

class Response:
    def __init__(self, response: httpx.Response) -> None: ...
    def to_native(self) -> Any: ...
    @property
    def response(self) -> httpx.Response: ...
    def __getattr__(self, attr: str) -> Any:
        return getattr(self.__response, attr)
