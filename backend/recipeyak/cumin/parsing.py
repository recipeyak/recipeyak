from __future__ import annotations

import decimal
import enum
import itertools
from dataclasses import dataclass
from decimal import Decimal
from enum import Enum

_MALFORMED_UNITS = {"large", "medium", "small", "fresh"}

_quantity_chars = set(" /.0123456789")

_UNICODE_FRACTION_MAPPING = {
    "½": "1/2",
    "⅓": "1/3",
    "⅔": "2/3",
    "¼": "1/4",
    "¾": "3/4",
    "⅕": "1/5",
    "⅖": "2/5",
    "⅗": "3/5",
    "⅘": "4/5",
    "⅙": "1/6",
    "⅚": "5/6",
    "⅐": "1/7",
    "⅛": "1/8",
    "⅜": "3/8",
    "⅝": "5/8",
    "⅞": "7/8",
    "⅑": "1/9",
    "⅒": "1/10",
}


def _unicode_fractions_to_ascii(s: str) -> str:
    """
    convert occurances of unicode fractions like `½` to their ascii
    equivalent `1/2`
    """

    output = ""
    for char in s:
        expanded = _UNICODE_FRACTION_MAPPING.get(char, char)
        # ensure 1¾ becomes 1 3/4, not 13/4
        if output and output[-1].isdigit() and expanded != char:
            output += " "
        output += expanded

    return output


def _max_quantity(quantity: str) -> str:
    """
    take the '4-5' medium button mushrooms and find the max, 5

    1 cup plain whole-milk
    """
    if " to " in quantity:
        return quantity.split(" to ")[-1]
    return quantity.split("-")[-1]


@enum.unique
class Unit(str, Enum):
    # mass/weight
    POUND = "POUND"
    OUNCE = "OUNCE"
    # metric
    GRAM = "GRAM"
    KILOGRAM = "KILOGRAM"

    # volume
    TEASPOON = "TEASPOON"
    TABLESPOON = "TABLESPOON"
    FLUID_OUNCE = "FLUID_OUNCE"
    CUP = "CUP"
    PINT = "PINT"
    QUART = "QUART"
    GALLON = "GALLON"
    # metric volume
    LITER = "LITER"
    MILLILITER = "MILLILITER"

    # covers "pinch", "sprinkle", "dash", "some", etc.
    SOME = "SOME"

    # for instance `1 cucumber`
    NONE = "NONE"

    # "1 bag", we don't parse bag so we just return UNKNOWN and let the caller
    # handle the result
    UNKNOWN = "UNKNOWN"

    def base_unit(self) -> BaseUnit:
        if self in _VOLUME:
            return BaseUnit.VOLUME
        if self in _MASS:
            return BaseUnit.MASS
        if self == Unit.SOME:
            return BaseUnit.SOME
        if self == Unit.NONE:
            return BaseUnit.NONE
        if self == Unit.UNKNOWN:
            return BaseUnit.UNKNOWN
        raise UnhandledCaseError(case=self)

    def __lt__(self, other: Unit) -> bool:  # type: ignore[override]
        if self in _VOLUME:
            return _VOLUME[self] < _VOLUME[other]
        if self in _MASS:
            return _MASS[self] < _MASS[other]
        return False


def _get_unit(val: str) -> Unit:
    val_cased = val.strip()
    val = val_cased.lower()
    if "cup" in val:
        return Unit.CUP
    if val == "kg":
        return Unit.KILOGRAM
    if "gram" in val:
        return Unit.GRAM
    if "gallon" in val:
        return Unit.GALLON
    if "ounce" in val or val == "oz":
        return Unit.OUNCE
    if "milliliter" in val:
        return Unit.MILLILITER
    if val_cased == "t" or "tsp" in val or "teaspoon" in val:
        return Unit.TEASPOON
    if val_cased == "T" or "tbs" in val or "tablespoon" in val:
        return Unit.TABLESPOON
    if "pinch" in val:
        return Unit.SOME
    if "lbs" in val or "lb" in val or "pound" in val:
        return Unit.POUND
    if "quart" in val:
        return Unit.QUART
    if "liter" in val:
        return Unit.LITER
    if val in {"some", "sprinkle", "dash"}:
        return Unit.SOME
    if val == "":
        return Unit.NONE
    return Unit.UNKNOWN


def _fraction_to_decimal(val: str) -> Decimal | None:
    try:
        total = Decimal(0)
        for v in val.strip().split(" "):
            if "/" in v:
                top, bot = v.split("/")
                total += Decimal(top) / Decimal(bot)
            else:
                total += Decimal(v)
        return total
    except decimal.InvalidOperation:
        return None


def _is_unit(val: str) -> bool:
    return _get_unit(val) != Unit.UNKNOWN


@dataclass
class Quantity:
    quantity: Decimal
    unit: Unit
    unknown_unit: str | None = None

    def __add__(self, other: Quantity) -> Quantity:
        if self.unit == other.unit != Unit.UNKNOWN:
            return Quantity(quantity=self.quantity + other.quantity, unit=self.unit)
        if (
            self.unit == other.unit == Unit.UNKNOWN
            and self.unknown_unit == other.unknown_unit
        ):
            return Quantity(
                quantity=self.quantity + other.quantity,
                unit=Unit.UNKNOWN,
                unknown_unit=self.unknown_unit,
            )
        if self.unit == Unit.SOME:
            return other
        if other.unit == Unit.SOME:
            return self
        if self.unit.base_unit() == other.unit.base_unit():
            if self.unit == Unit.UNKNOWN:
                raise IncompatibleUnitError(units=(self.unit, other.unit))
            unit_lookup = _VOLUME if self.unit in _VOLUME else _MASS
            smallest_unit = self.unit if self.unit < other.unit else other.unit
            quantity = self.to_base_unit().quantity + other.to_base_unit().quantity
            return Quantity(
                quantity=quantity / unit_lookup[smallest_unit], unit=smallest_unit
            )
        raise IncompatibleUnitError(units=(self.unit, other.unit))

    def __str__(self) -> str:
        if self.unit == Unit.SOME:
            return "some"
        if self.unit == Unit.NONE:
            return str(self.quantity)
        unit = str(self.unit)
        return f"{self.quantity} {unit}"

    def to_base_unit(self) -> Quantity:
        if self.unit.base_unit() == BaseUnit.VOLUME:
            return Quantity(
                unit=Unit.MILLILITER, quantity=_VOLUME[self.unit] * self.quantity
            )
        if self.unit.base_unit() == BaseUnit.MASS:
            return Quantity(unit=Unit.GRAM, quantity=_MASS[self.unit] * self.quantity)
        return self


def _parse_quantity(val: str) -> Quantity:
    value = iter(_unicode_fractions_to_ascii(_max_quantity(val).strip()))

    quantity = ""
    unit_str = ""
    for c in value:
        if c in _quantity_chars:
            quantity += c
        else:
            unit_str += c
            break

    for c in value:
        if c in _quantity_chars:
            break
        # handle case of two units and quantities next to each other
        unit_str += c

    # strip out misplaced words, e.g., `1 large` `lemon` instead of `1` `large lemon`
    if unit_str in _MALFORMED_UNITS:
        unit_str = ""

    unit = _get_unit(unit_str)

    unknown_unit = None
    if unit == Unit.UNKNOWN:
        unknown_unit = unit_str

    return Quantity(
        quantity=_fraction_to_decimal(quantity) or Decimal(1),
        unit=unit,
        unknown_unit=unknown_unit,
    )


@dataclass
class UnhandledCaseError(Exception):
    case: Unit


@dataclass
class IncompatibleUnitError(Exception):
    units: tuple[Unit, Unit]


@enum.unique
class BaseUnit(Enum):
    MASS = "MASS"
    VOLUME = "VOLUME"
    SOME = "SOME"
    NONE = "NONE"
    UNKNOWN = "UNKNOWN"


_TEASPOON_ML = Decimal(4.92892)
_TABLESPOON_ML = 3 * _TEASPOON_ML
_FLUID_OUNCE_ML = 2 * _TABLESPOON_ML
_CUP_ML = 8 * _FLUID_OUNCE_ML
_PINT_ML = 2 * _CUP_ML
_QUART_ML = 2 * _PINT_ML
_GALLON_ML = 4 * _QUART_ML


_OUNCE_GRAM = Decimal(28.34952)

_MASS: dict[Unit, Decimal] = {
    Unit.GRAM: Decimal(1),
    Unit.OUNCE: _OUNCE_GRAM,
    Unit.POUND: 16 * _OUNCE_GRAM,
    Unit.KILOGRAM: Decimal(1000),
}


_VOLUME: dict[Unit, Decimal] = {
    Unit.MILLILITER: Decimal(1),
    Unit.TEASPOON: _TEASPOON_ML,
    Unit.TABLESPOON: _TABLESPOON_ML,
    Unit.FLUID_OUNCE: _FLUID_OUNCE_ML,
    Unit.CUP: _CUP_ML,
    Unit.PINT: _PINT_ML,
    Unit.QUART: _QUART_ML,
    Unit.LITER: Decimal(1000),
    Unit.GALLON: _GALLON_ML,
}


def parse_quantity(val: str) -> Quantity:
    """
    handle "3 Tablespoon + 1 teaspoon" format
    """
    quantities = val.split("+")
    a = _parse_quantity(quantities[0])
    for q in quantities[1:]:
        a += _parse_quantity(q)
    return a


@dataclass(frozen=True, slots=True)
class _IngredientResult:
    quantity: str
    name: str
    description: str = ""
    optional: bool = False


# TODO(sbdchd): these should be all the units available!!!
_UNIT_TO_ALIASES: dict[Unit, list[str]] = {
    Unit.CUP: ["cup", "cups"],
    Unit.KILOGRAM: ["kg", "kgs", "kilogram", "kilograms"],
    Unit.GRAM: ["gram", "grams", "g"],
    Unit.GALLON: ["gal", "gallon", "gallons"],
    Unit.OUNCE: ["oz", "ounce", "ounces"],
    Unit.MILLILITER: ["millilter", "ml"],
    Unit.TEASPOON: ["tsp", "teaspoon", "teaspoons", "t"],
    Unit.TABLESPOON: ["tablespoon", "tablespoons", "tbsp", "tbs", "T"],
    Unit.POUND: [
        "pound",
        "pounds",
        "lbs",
        "lb",
    ],
    Unit.SOME: [
        "pinch",
        "pinch of",
        "some",
        "sprinkle",
        "dash",
    ],
    Unit.QUART: [
        "quart",
        "quarts",
    ],
    Unit.LITER: [
        "liter",
        "liters",
        "l",
    ],
}

# NOTE(sbdchd): we add some whitespace so when we search the ingredient for the quantity
_units_ws = tuple(
    x + " " for x in itertools.chain.from_iterable(_UNIT_TO_ALIASES.values())
)

_larger_to_smaller_units_ws = sorted(_units_ws, key=lambda x: -len(x))


def _starts_with(string: str, prefixes: tuple[str, ...] | str) -> bool:
    """
    case insensitive str.starts_with
    """
    if isinstance(prefixes, str):
        prefixes = (prefixes,)
    for prefix in prefixes:
        if string[: len(prefix)].casefold() == prefix.casefold():
            return True
    return False


def _parse_quantity_name(text: str) -> tuple[str, str]:
    """
    examples:
      1 cup flour -> 1 cup, flour
      fine sea salt -> some, fine sea salt
      1 tablespoon or 1/3 teaspoon foo bar buzz
      1 1/2 teaspoons minced fresh thyme (or 1/2 teaspoon dried thyme)
      Chopped fresh parsley, for serving (optional)
    """

    value = _unicode_fractions_to_ascii(text.strip())
    quantity = ""
    name = ""

    idx = 0
    in_quantity = True

    while idx < len(value):
        c = value[idx]
        # parse digit like characters into a quantity or name
        if c.isdigit() or c in {"/", ".", "-"}:
            if in_quantity:
                quantity += c
            else:
                name += c
            idx += 1
            continue
        # ensure w/ '7 to 8 cups', the 'to 8` is added to the quantity portion
        # of the result
        elif in_quantity and c == "t" and value[idx - 1 : idx + 3] == " to ":
            letters = "to "
            quantity += letters
            idx += len(letters)
            continue
        elif c.isspace():
            if in_quantity:
                quantity += c
            else:
                name += c
            idx += 1
            continue
        else:
            if _starts_with(value[idx:], _units_ws) and in_quantity:
                in_quantity = False
                eat_count = 0
                for unit in _larger_to_smaller_units_ws:
                    if _starts_with(value[idx:], unit):
                        eat_count = len(unit)
                        break
                for _ in range(eat_count):
                    quantity += value[idx]
                    idx += 1
                # parse the parens that can occur after quantities, like:
                #   12 ounces (about 4 to 6 thighs)
                if value[idx] == "(":
                    while value[idx] != ")":
                        quantity += value[idx]
                        idx += 1
                    quantity += value[idx]
                    idx += 1
                    # parse: 1/2 cup (8 Tablespoons)/115 grams butter
                    if value[idx] == "/":
                        in_quantity = True
                for conjunction in ("plus", "+"):
                    if _starts_with(value[idx:], conjunction):
                        quantity += conjunction
                        idx += len(conjunction)
                        in_quantity = True
                continue
            if in_quantity:
                in_quantity = False
            name += c
            idx += 1
            continue

    return (quantity.strip(), name.strip())


_NON_INGREDIENT_NAMES = frozenset(
    {"bone-in", "skin-on", "fresh", "cooked", "raw", "frozen", "skinless", "boneless"}
)


def _parse_name_description(text: str) -> tuple[str, str]:
    """
    Some basic heuristics to partition a string into a name and description pair
    """
    prefix = ""
    temp = []
    is_all_suffix_now = False
    for word in text.split():
        if word.endswith(",") and not is_all_suffix_now:
            word_stripped = word.removesuffix(",")
            if word_stripped in _NON_INGREDIENT_NAMES:
                temp.append(word)
                continue
            if _is_unit(word_stripped):
                temp.append(word_stripped)
                continue
            temp.append(word_stripped)
            prefix = " ".join(temp)
            is_all_suffix_now = True
            temp = []
        else:
            temp.append(word)
    suffix = " ".join(temp)
    if not prefix:
        return (suffix, "")
    return (prefix, suffix)


# For example:
#   "Kosher salt" -> "kosher salt"
#   "Some Other Stuff" -> "Some Other Stuff"
def _normalize_name(text: str) -> str:
    text = text.strip()
    words = iter(text.split())
    first_word = next(words, None)
    if first_word is None:
        # no first word for some reason
        return text
    first_word_is_upper = first_word[0].isupper()
    following_words_are_lower = all(x[0].islower() for x in words)
    if first_word_is_upper and following_words_are_lower:
        return text.lower()
    return text


def parse_ingredient(text: str) -> _IngredientResult:
    quantity_name, description = _parse_name_description(text)
    quantity, name = _parse_quantity_name(quantity_name)
    is_optional = "optional" in text.lower()

    if is_optional:
        for suffix in (
            "(optional)",
            "optional",
            "[optional]",
            "Optional",
            "(Optional)",
            "[Optional]",
        ):
            if description.endswith(suffix):
                description = description[: -len(suffix)]
                break
            elif name.endswith(suffix):
                name = name[: -len(suffix)]
                break

    return _IngredientResult(
        # Some seems like a good default instead of empty string. Empty string
        # looks a little weird in the UI.
        quantity=quantity.strip() or "some",
        name=_normalize_name(name),
        description=description.strip(),
        optional=is_optional,
    )
