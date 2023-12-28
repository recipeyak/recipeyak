from typing import Any

from ably.rest.rest import AblyRest
from ably.types.tokenrequest import TokenRequest

class Auth:
    def __init__(self, ably: AblyRest, options: Any) -> None: ...
    async def create_token_request(
        self,
        token_params: dict[str, Any] | None = None,
        key_name: str | None = None,
        key_secret: str | None = None,
        query_time: Any | None = None,
    ) -> TokenRequest: ...
