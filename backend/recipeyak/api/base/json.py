from collections.abc import ValuesView
from typing import Any

import orjson
import pydantic


def default(o: object) -> Any:
    if isinstance(o, pydantic.BaseModel):
        return o.dict()
    if isinstance(o, ValuesView):
        return list(o)
    raise TypeError


def json_dumps(data: Any, indent: bool = False) -> bytes:
    """
    Serialize `data` to a JSON formatted byte string.
    """
    if data is None:
        return b""
    options = orjson.OPT_NON_STR_KEYS
    if indent:
        options |= orjson.OPT_INDENT_2
    return orjson.dumps(data, default=default, option=options)


def json_loads(data: bytes | bytearray | memoryview | str) -> Any:
    return orjson.loads(data)
