import dataclasses
from decimal import Decimal

from rest_framework.renderers import JSONRenderer as DRFJSONRenderer
from rest_framework.utils.encoders import JSONEncoder as DRFEncoder


class JSONEncoder(DRFEncoder):
    def default(self, o):
        if dataclasses.is_dataclass(o):
            return dataclasses.asdict(o)
        if isinstance(o, Decimal):
            return str(o.normalize())
        return super().default(o)


class JSONRenderer(DRFJSONRenderer):
    """
    We define our own renderer so we can return dataclasses and decimals in
    in our calls to Response. The default DRF JSONEncoder supports decimals
    but converts them to floats. Normalizing Decimals gives a more human readable
    output.
    """

    encoder_class = JSONEncoder
