from typing import Any

import orjson
from django.http import HttpResponse

from recipeyak.api.base.json import default


class JsonResponse(HttpResponse):
    def __init__(
        self,
        data: Any = None,
        **kwargs: Any,
    ) -> None:
        kwargs.setdefault("content_type", "application/json")
        if data is None:
            content = b""
        else:
            content = orjson.dumps(
                data, default=default, option=orjson.OPT_NON_STR_KEYS
            )
        super().__init__(content=content, **kwargs)
