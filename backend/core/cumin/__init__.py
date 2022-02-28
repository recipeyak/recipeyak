import decimal
import enum
from collections import defaultdict
from dataclasses import dataclass, field
from decimal import Decimal
from enum import Enum
from typing import Dict, List, Optional, Sequence, Tuple, Union

from core.schedule.inflect import singularize


@dataclass
class UnhandledCase(Exception):
    case: "Unit"


@dataclass
class IncompatibleUnit(Exception):
    units: Tuple["Unit", "Unit"]


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

    def base_unit(self) -> "BaseUnit":
        if self in VOLUME:
            return BaseUnit.VOLUME
        if self in MASS:
            return BaseUnit.MASS
        if self == Unit.SOME:
            return BaseUnit.SOME
        if self == Unit.NONE:
            return BaseUnit.NONE
        if self == Unit.UNKNOWN:
            return BaseUnit.UNKNOWN
        raise UnhandledCase(case=self)

    def __lt__(self, other) -> bool:
        if self in VOLUME:
            return VOLUME[self] < VOLUME[other]
        if self in MASS:
            return MASS[self] < MASS[other]
        return False


TEASPOON_ML = Decimal(4.92892)
TABLESPOON_ML = 3 * TEASPOON_ML
FLUID_OUNCE_ML = 2 * TABLESPOON_ML
CUP_ML = 8 * FLUID_OUNCE_ML
PINT_ML = 2 * CUP_ML
QUART_ML = 2 * PINT_ML
GALLON_ML = 4 * QUART_ML

VOLUME: Dict[Unit, Decimal] = {
    Unit.MILLILITER: Decimal(1),
    Unit.TEASPOON: TEASPOON_ML,
    Unit.TABLESPOON: TABLESPOON_ML,
    Unit.FLUID_OUNCE: FLUID_OUNCE_ML,
    Unit.CUP: CUP_ML,
    Unit.PINT: PINT_ML,
    Unit.QUART: QUART_ML,
    Unit.LITER: Decimal(1000),
    Unit.GALLON: GALLON_ML,
}

OUNCE_GRAM = Decimal(28.34952)

MASS: Dict[Unit, Decimal] = {
    Unit.GRAM: Decimal(1),
    Unit.OUNCE: OUNCE_GRAM,
    Unit.POUND: 16 * OUNCE_GRAM,
    Unit.KILOGRAM: Decimal(1000),
}


@enum.unique
class BaseUnit(Enum):
    MASS = "MASS"
    VOLUME = "VOLUME"
    SOME = "SOME"
    NONE = "NONE"
    UNKNOWN = "UNKNOWN"


@dataclass
class Quantity:
    quantity: Decimal
    unit: Unit
    unknown_unit: Optional[str] = None

    def __add__(self, other: "Quantity") -> "Quantity":
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
                raise IncompatibleUnit(units=(self.unit, other.unit))
            unit_lookup = VOLUME if self.unit in VOLUME else MASS
            smallest_unit = self.unit if self.unit < other.unit else other.unit
            quantity = self.to_base_unit().quantity + other.to_base_unit().quantity
            return Quantity(
                quantity=quantity / unit_lookup[smallest_unit], unit=smallest_unit
            )
        raise IncompatibleUnit(units=(self.unit, other.unit))

    def __str__(self) -> str:
        if self.unit == Unit.SOME:
            return "some"
        if self.unit == Unit.NONE:
            return str(self.quantity)
        unit = str(self.unit)
        return f"{self.quantity} {unit}"

    def to_base_unit(self) -> "Quantity":
        if self.unit.base_unit() == BaseUnit.VOLUME:
            return Quantity(
                unit=Unit.MILLILITER, quantity=VOLUME[self.unit] * self.quantity
            )
        if self.unit.base_unit() == BaseUnit.MASS:
            return Quantity(unit=Unit.GRAM, quantity=MASS[self.unit] * self.quantity)
        return self


@dataclass
class Ingredient:
    quantity: str
    name: str
    description: str = ""


UNICODE_FRACTION_MAPPING = {
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


def unicode_fractions_to_ascii(s: str) -> str:
    """
    convert occurances of unicode fractions like `½` to their ascii
    equivalent `1/2`
    """

    output = ""
    for char in s:
        output += UNICODE_FRACTION_MAPPING.get(char, char)

    return output


quantity_chars = {c for c in " /.0123456789"}


def get_unit(val: str) -> Unit:
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


def fraction_to_decimal(val: str) -> Optional[Decimal]:
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


def max_quantity(quantity: str) -> str:
    """
    take the '4-5' medium button mushrooms and find the max, 5
    """
    if " to " in quantity:
        return quantity.split(" to ")[-1]
    return quantity.split("-")[-1]


def parse_quantity(val: str) -> Quantity:
    """
    handle "3 Tablespoon + 1 teaspoon" format
    """
    quantities = val.split("+")
    a = _parse_quantity(quantities[0])
    for q in quantities[1:]:
        a += _parse_quantity(q)
    return a


MALFORMED_UNITS = {"large", "medium", "small", "fresh"}


def _parse_quantity(val: str) -> Quantity:
    value = iter(unicode_fractions_to_ascii(max_quantity(val).strip()))

    quantity = ""
    unit_str = ""
    for c in value:
        if c in quantity_chars:
            quantity += c
        else:
            unit_str += c
            break

    for c in value:
        if c in quantity_chars:
            break
        # handle case of two units and quantities next to each other
        unit_str += c

    # strip out misplaced words, e.g., `1 large` `lemon` instead of `1` `large lemon`
    if unit_str in MALFORMED_UNITS:
        unit_str = ""

    unit = get_unit(unit_str)

    unknown_unit = None
    if unit == Unit.UNKNOWN:
        unknown_unit = unit_str

    return Quantity(
        quantity=fraction_to_decimal(quantity) or Decimal(1),
        unit=unit,
        unknown_unit=unknown_unit,
    )


def normalize_ingredient_name(*, name: str) -> str:
    return name.replace("-", " ").lower()


@dataclass
class IngredientItem:
    quantities: List[Quantity] = field(default_factory=list)
    category: Optional[str] = None


IngredientList = Dict[str, IngredientItem]


def combine_ingredients(ingredients: Sequence[Ingredient]) -> IngredientList:
    # being kind of dynamic with the types here so not the easiest on the eyes.
    ingredient_map: Dict[str, Dict[Union[BaseUnit, str, None], Quantity]] = defaultdict(
        dict
    )

    plural_name: Dict[str, str] = dict()

    for ingr in ingredients:
        normalized_name = normalize_ingredient_name(name=ingr.name)
        quantity = parse_quantity(ingr.quantity)
        base_unit = quantity.unit.base_unit()
        name = singularize(normalized_name)

        # keep track of whether an ingredient should be plural
        if name != normalized_name:
            plural_name[name] = normalized_name

        if base_unit == BaseUnit.UNKNOWN:
            # For each Unit.UNKNOWN, we treat the unknown_unit, as a unique
            # base value.
            if quantity.unknown_unit not in ingredient_map[name]:
                ingredient_map[name][quantity.unknown_unit] = quantity
            else:
                ingredient_map[name][quantity.unknown_unit] += quantity
        elif name not in ingredient_map:
            ingredient_map[name][base_unit] = quantity
        else:
            base_unit_quantity = ingredient_map[name].get(base_unit)
            if base_unit_quantity is None:
                ingredient_map[name][base_unit] = quantity
            else:
                ingredient_map[name][base_unit] = base_unit_quantity + quantity

    output: IngredientList = defaultdict(IngredientItem)

    for ingre_name, unit_to_quantity in ingredient_map.items():
        name = plural_name.get(ingre_name, ingre_name)
        output[name].quantities += unit_to_quantity.values()

    return output
