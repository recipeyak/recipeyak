from decimal import Decimal

from recipeyak.api.base.decimal import fmt_decimal


def test_decimal_encoding() -> None:
    data = {
        "whole_number": Decimal(750),
        "trailing_zeros": Decimal("4.000000000000000000000000000"),
        "decimal": Decimal(1) / Decimal(8),
        # In this case, some formatting solutions would fail because they would
        # cast the `Decimal` to `float` and we'd lose precision.
        "larger_than_float": Decimal("2000000.123456789"),
        # rounding errors
        "rounding_errors": Decimal("6.500000000000000000000000002"),
        "fractions": Decimal("0.3333333333333333333333333333"),
    }

    assert {k: fmt_decimal(v) for k, v in data.items()} == {
        "whole_number": "750",
        "trailing_zeros": "4",
        "decimal": "1/8",
        "fractions": "1/3",
        "larger_than_float": "2000000.123",
        "rounding_errors": "6.5",
    }
