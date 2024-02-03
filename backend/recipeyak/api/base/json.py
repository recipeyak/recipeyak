from collections.abc import ValuesView
from decimal import Decimal
from typing import Any

import orjson
import pydantic

MAX_DECIMAL_PLACES = 8


def fmt_decimal(d: Decimal) -> str:
    """
    remove trailing zeros

    Decimal("4.0000") -> "4"
    """
    d = round(d, MAX_DECIMAL_PLACES)
    if d == d.to_integral():
        return str(d.quantize(Decimal(1)))
    return str(d.normalize())


def default(o: object) -> Any:
    if isinstance(o, Decimal):
        return fmt_decimal(o)
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
