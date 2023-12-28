from typing import Any

class Message:
    def __init__(
        self,
        name: Any | None = None,
        data: Any | None = None,
        client_id: Any | None = None,
        id: Any | None = None,
        connection_id: Any | None = None,
        connection_key: Any | None = None,
        encoding: Any | None = "",
        timestamp: Any | None = None,
        extras: Any | None = None,
    ) -> None: ...
