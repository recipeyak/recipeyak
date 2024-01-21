from typing import Any, TypedDict

from ably.rest.rest import AblyRest
from ably.types.tokenrequest import TokenRequest

class _TokenParams(TypedDict):
    client_id: str
    capability: dict[str, Any]

class Auth:
    def __init__(self, ably: AblyRest, options: Any) -> None: ...
    async def create_token_request(
        self,
        token_params: _TokenParams,
        key_name: str | None = None,
        key_secret: str | None = None,
        query_time: Any | None = None,
    ) -> TokenRequest: ...
