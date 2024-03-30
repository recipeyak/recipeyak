from decimal import Decimal
from fractions import Fraction

_MAX_DECIMAL_PLACES = 8


def fmt_decimal(d: Decimal) -> str:
    """
    remove trailing zeros

    Decimal("4.0000") -> "4"
    """
    if d < 1:
        # 0.5 -> 1/2
        # 0.333333 -> 1/3
        num, denom = Fraction(d).limit_denominator().as_integer_ratio()
        return f"{num}/{denom}"
    d = round(d, _MAX_DECIMAL_PLACES)
    if d == d.to_integral():
        return str(d.quantize(Decimal(1)))
    # only allow up to 3 decimal places
    return str(d.normalize().quantize(Decimal("1.000")).normalize())
