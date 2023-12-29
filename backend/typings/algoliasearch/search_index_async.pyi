from collections.abc import Iterable
from typing import Any

from algoliasearch.search_index import SearchIndex

class SearchIndexAsync(SearchIndex):
    def __init__(
        self, search_index: Any, transporter: Any, config: Any, name: Any
    ) -> None: ...
    async def save_objects_async(self, objects: Iterable[dict[str, Any]]) -> None: ...
    async def wait_task_async(
        self, task_id: int, request_options: Any | None = None
    ) -> None: ...
