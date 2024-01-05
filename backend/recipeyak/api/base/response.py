from datetime import timedelta
from typing import Any, Self

from django.http import HttpResponse

from recipeyak.api.base.json import json_dumps
from recipeyak.api.base.yaml import yaml_dumps


class JsonResponse(HttpResponse):
    def __init__(
        self,
        data: Any = None,
        **kwargs: Any,
    ) -> None:
        kwargs.setdefault("content_type", "application/json")
        content = json_dumps(data)
        super().__init__(content=content, **kwargs)

    def max_age(self, delta: timedelta) -> Self:
        seconds = int(delta.total_seconds())
        self["Cache-Control"] = f"max-age={seconds}, must-revalidate, private"
        return self


class YamlResponse(HttpResponse):
    """
    An HTTP response class that consumes data to be serialized to YAML.
    :param data: Data to be dumped into yaml.
    """

    def __init__(self, data: Any, **kwargs: Any) -> None:
        kwargs.setdefault("content_type", "text/x-yaml")
        content = yaml_dumps(data)
        super().__init__(content=content, **kwargs)
