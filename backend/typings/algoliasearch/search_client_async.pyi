from typing import Any, Self

from algoliasearch.search_client import SearchClient
from algoliasearch.search_index_async import SearchIndexAsync

class SearchClientAsync(SearchClient):
    def __init__(
        self,
        search_client: SearchClient,
        transporter: Any,
        search_config: Any,
    ) -> None: ...
    def init_index(self, name: str) -> SearchIndexAsync: ...
    async def __aenter__(self) -> Self: ...
    async def __aexit__(self, exc_type: Any, exc: Any, tb: Any) -> None: ...
