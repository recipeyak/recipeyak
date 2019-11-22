import dataclasses
from decimal import Decimal, getcontext

from rest_framework.renderers import JSONRenderer as DRFJSONRenderer
from rest_framework.utils.encoders import JSONEncoder as DRFEncoder

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


class JSONEncoder(DRFEncoder):
    def default(self, o):
        if dataclasses.is_dataclass(o):
            return dataclasses.asdict(o)
        if isinstance(o, Decimal):
            return fmt_decimal(o)
        return super().default(o)


class JSONRenderer(DRFJSONRenderer):
    """
    We define our own renderer so we can return dataclasses and decimals in
    in our calls to Response. The default DRF JSONEncoder supports decimals
    but converts them to floats. Normalizing Decimals gives a more human readable
    output.
    """

    encoder_class = JSONEncoder
