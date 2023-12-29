from typing import Any

from algoliasearch.search_client_async import SearchClientAsync

class SearchClient:
    @property
    def app_id(self) -> str: ...
    def __init__(self, transporter: Any, search_config: Any) -> None: ...
    @staticmethod
    def create(
        app_id: str | None = None, api_key: str | None = None
    ) -> SearchClientAsync: ...
    @staticmethod
    def generate_secured_api_key(
        parent_api_key: str, restrictions: dict[str, Any]
    ) -> str: ...
