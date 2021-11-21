import json
from decimal import Decimal

from core.renderers import JSONRenderer


def test_decimal_encoding() -> None:
    data = dict(
        whole_number=Decimal(750),
        trailing_zeros=Decimal("4.000000000000000000000000000"),
        decimal=Decimal(1) / Decimal(8),
        # In this case, some formatting solutions would fail because they would
        # cast the `Decimal` to `float` and we'd lose precision.
        larger_than_float=Decimal("2000000.123456789"),
        # rounding errors
        rounding_errors=Decimal("6.500000000000000000000000002"),
    )

    assert json.loads(JSONRenderer().render(data)) == dict(
        whole_number="750",
        trailing_zeros="4",
        decimal="0.125",
        larger_than_float="2000000.12345679",
        rounding_errors="6.5",
    )
