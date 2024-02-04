from typing import Any, Generic, TypeVar

from django.http import HttpResponse

from recipeyak.api.base.json import json_dumps
from recipeyak.api.base.yaml import yaml_dumps

_T = TypeVar("_T")


class JsonResponse(HttpResponse, Generic[_T]):
    def __init__(
        self,
        data: _T,
        **kwargs: Any,
    ) -> None:
        if data is None and (kwargs.get("status", 200) != 204):
            raise ValueError("data must not be None unless status is 204")
        kwargs.setdefault("content_type", "application/json")
        content = json_dumps(data)
        super().__init__(content=content, **kwargs)


class YamlResponse(HttpResponse):
    """
    An HTTP response class that consumes data to be serialized to YAML.
    :param data: Data to be dumped into yaml.
    """

    def __init__(self, data: Any, **kwargs: Any) -> None:
        kwargs.setdefault("content_type", "text/x-yaml")
        content = yaml_dumps(data)
        super().__init__(content=content, **kwargs)
