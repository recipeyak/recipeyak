from decimal import Decimal
from typing import Any

import orjson
import pydantic
from rest_framework.renderers import JSONRenderer as DRFJSONRenderer

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
    raise TypeError


class JSONRenderer(DRFJSONRenderer):
    """
    We define our own renderer so we can return dataclasses and decimals in
    in our calls to Response. The default DRF JSONEncoder supports decimals
    but converts them to floats. Normalizing Decimals gives a more human readable
    output.
    """

    def render(
        self, data: Any, accepted_media_type: Any = None, renderer_context: Any = None
    ) -> bytes:
        """
        Render `data` into JSON, returning a bytestring.
        """
        if data is None:
            return b""

        return orjson.dumps(data, default=default, option=orjson.OPT_NON_STR_KEYS)
