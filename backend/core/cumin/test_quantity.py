from __future__ import annotations

from decimal import Decimal

import pytest

from core.cumin.combine import Quantity
from core.cumin.quantity import (
    IncompatibleUnit,
    IngredientResult,
    Unit,
    fraction_to_decimal,
    parse_ingredient,
    parse_quantity,
    parse_quantity_name,
)


@pytest.mark.parametrize(
    "quantity,expected",
    [
        ("1/2 Tablespoon", Quantity(quantity=Decimal(0.5), unit=Unit.TABLESPOON)),
        ("3 1/2 Tablespoon", Quantity(quantity=Decimal(3.5), unit=Unit.TABLESPOON)),
        ("1 tsp", Quantity(quantity=Decimal(1), unit=Unit.TEASPOON)),
        ("4 oz", Quantity(quantity=Decimal(4), unit=Unit.OUNCE)),
        ("4 ounces/112 grams", Quantity(quantity=Decimal(4), unit=Unit.OUNCE)),
        ("4 ounces", Quantity(quantity=Decimal(4), unit=Unit.OUNCE)),
        ("1 1/2 cups", Quantity(quantity=Decimal(1.5), unit=Unit.CUP)),
        ("3lbs", Quantity(quantity=Decimal(3), unit=Unit.POUND)),
        ("225 grams", Quantity(quantity=Decimal(225), unit=Unit.GRAM)),
        ("1 kg", Quantity(quantity=Decimal(1), unit=Unit.KILOGRAM)),
        ("pinch", Quantity(quantity=Decimal(1), unit=Unit.SOME)),
        ("1/2 liter", Quantity(quantity=Decimal(0.5), unit=Unit.LITER)),
        ("180 milliliters", Quantity(quantity=Decimal(180), unit=Unit.MILLILITER)),
        ("2 quarts", Quantity(quantity=Decimal(2), unit=Unit.QUART)),
        ("1/2 gallon", Quantity(quantity=Decimal(0.5), unit=Unit.GALLON)),
        ("½ gallon", Quantity(quantity=Decimal(0.5), unit=Unit.GALLON)),
        ("⅓ tsp", Quantity(quantity=Decimal(1) / Decimal(3), unit=Unit.TEASPOON)),
        ("1/8 t", Quantity(quantity=Decimal(1) / Decimal(8), unit=Unit.TEASPOON)),
        ("1/8 T", Quantity(quantity=Decimal(1) / Decimal(8), unit=Unit.TABLESPOON)),
        ("1 tbs", Quantity(quantity=Decimal(1), unit=Unit.TABLESPOON)),
        ("4-5", Quantity(quantity=Decimal(5), unit=Unit.NONE)),
        ("4 to 6", Quantity(quantity=Decimal(6), unit=Unit.NONE)),
        ("1lb", Quantity(quantity=Decimal(1), unit=Unit.POUND)),
        ("1 pound", Quantity(quantity=Decimal(1), unit=Unit.POUND)),
        ("1 bag", Quantity(quantity=Decimal(1), unit=Unit.UNKNOWN, unknown_unit="bag")),
        (
            "1 Tablespoon + 1 teaspoon",
            Quantity(quantity=Decimal(4), unit=Unit.TEASPOON),
        ),
        ("some", Quantity(quantity=Decimal(1), unit=Unit.SOME)),
        ("1", Quantity(quantity=Decimal(1), unit=Unit.NONE)),
    ],
)
def test_parsing_quantities(quantity: str, expected: Quantity | None) -> None:
    assert parse_quantity(quantity) == expected


@pytest.mark.parametrize(
    "fraction,expected",
    [("1/2", Decimal(0.5)), ("11/2", Decimal(5.5)), ("1 1/2", Decimal(1.5))],
)
def test_fraction_to_decimal(fraction: str, expected: Decimal | None) -> None:
    assert fraction_to_decimal(fraction) == expected


@pytest.mark.parametrize(
    "quantities,expected",
    [
        (
            (
                Quantity(quantity=Decimal(3), unit=Unit.POUND),
                Quantity(quantity=Decimal(1), unit=Unit.POUND),
            ),
            Quantity(quantity=Decimal(4), unit=Unit.POUND),
        ),
        (
            (
                Quantity(quantity=Decimal(0.5), unit=Unit.LITER),
                Quantity(quantity=Decimal(1), unit=Unit.LITER),
            ),
            Quantity(quantity=Decimal(1.5), unit=Unit.LITER),
        ),
        (
            (
                Quantity(quantity=Decimal(1), unit=Unit.TEASPOON),
                Quantity(quantity=Decimal(3), unit=Unit.TABLESPOON),
            ),
            Quantity(quantity=Decimal(10), unit=Unit.TEASPOON),
        ),
        (
            (
                Quantity(quantity=Decimal(1), unit=Unit.NONE),
                Quantity(quantity=Decimal(3), unit=Unit.NONE),
            ),
            Quantity(quantity=Decimal(4), unit=Unit.NONE),
        ),
        # check ordering
        (
            (
                Quantity(quantity=Decimal(150), unit=Unit.GRAM),
                Quantity(quantity=Decimal(1), unit=Unit.KILOGRAM),
            ),
            Quantity(quantity=Decimal(1150), unit=Unit.GRAM),
        ),
        (
            (
                Quantity(quantity=Decimal(1), unit=Unit.KILOGRAM),
                Quantity(quantity=Decimal(150), unit=Unit.GRAM),
            ),
            Quantity(quantity=Decimal(1150), unit=Unit.GRAM),
        ),
        # `some` should be removed when combined with a proper amount
        (
            (
                Quantity(quantity=Decimal(2), unit=Unit.TEASPOON),
                Quantity(quantity=Decimal(1), unit=Unit.SOME),
            ),
            Quantity(quantity=Decimal(2), unit=Unit.TEASPOON),
        ),
        (
            (
                Quantity(quantity=Decimal(1), unit=Unit.SOME),
                Quantity(quantity=Decimal(2), unit=Unit.TEASPOON),
            ),
            Quantity(quantity=Decimal(2), unit=Unit.TEASPOON),
        ),
        (
            (
                Quantity(quantity=Decimal(1), unit=Unit.UNKNOWN, unknown_unit="bag"),
                Quantity(quantity=Decimal(1), unit=Unit.UNKNOWN, unknown_unit="bag"),
            ),
            Quantity(quantity=Decimal(2), unit=Unit.UNKNOWN, unknown_unit="bag"),
        ),
    ],
)
def test_quantity_addition(
    quantities: tuple[Quantity, Quantity], expected: Quantity
) -> None:
    a, b = quantities
    assert a + b == expected


def test_adding_quantities_with_diff_unknown_units() -> None:
    """
    Units that are unknown shouldn't be combined if the `unknown_unit`
    doesn't match.
    """

    with pytest.raises(IncompatibleUnit):
        Quantity(quantity=Decimal(1), unit=Unit.UNKNOWN, unknown_unit="bag") + Quantity(
            quantity=Decimal(2), unit=Unit.UNKNOWN, unknown_unit="thing"
        )


def test_adding_incompatible_units() -> None:
    """
    MASS and VOLUME units should raise an error on addition. We handle this
    error higher up.
    """
    with pytest.raises(IncompatibleUnit):
        Quantity(quantity=Decimal(1), unit=Unit.TABLESPOON) + Quantity(
            quantity=Decimal(2), unit=Unit.GRAM
        )


@pytest.mark.parametrize(
    "ingredient,expected",
    [
        (
            "1 cup plain whole-milk yogurt",
            (
                "1 cup",
                "plain whole-milk yogurt",
            ),
        ),
        (
            "fine sea salt",
            (
                "",
                "fine sea salt",
            ),
        ),
        ("2 garlic cloves, grated", ("2", "garlic cloves, grated")),
        (
            "1 tablespoon chopped fresh oregano (or 1 teaspoon dried oregano)",
            ("1 tablespoon", "chopped fresh oregano (or 1 teaspoon dried oregano)"),
        ),
        (
            "1 1/2 teaspoons minced fresh thyme (or 1/2 teaspoon dried thyme)",
            ("1 1/2 teaspoons", "minced fresh thyme (or 1/2 teaspoon dried thyme)"),
        ),
        (
            "1 tablespoon olive oil, plus more for the grill or pan",
            ("1 tablespoon", "olive oil, plus more for the grill or pan"),
        ),
        (
            "1 teaspoon kosher salt (Diamond Crystal), plus more for serving",
            ("1 teaspoon", "kosher salt (Diamond Crystal), plus more for serving"),
        ),
        (
            "1/4 teaspoon black pepper, plus more for serving",
            ("1/4 teaspoon", "black pepper, plus more for serving"),
        ),
        (
            "1 lemon",
            ("1", "lemon"),
        ),
        (
            "1 cup flour",
            ("1 cup", "flour"),
        ),
        (
            "1 kg cheese",
            ("1 kg", "cheese"),
        ),
        (
            "1g water",
            ("1g", "water"),
        ),
        (
            # TODO(sbdchd): more of range test cases
            "1-3 lbs ground turkey breast",
            ("1-3 lbs", "ground turkey breast"),
        ),
        (
            "7 to 8 cups poison",
            ("7 to 8 cups", "poison"),
        ),
        (
            "3 1/2 cups water",
            ("3 1/2 cups", "water"),
        ),
        (
            "2 pounds boneless skinless chicken thighs",
            ("2 pounds", "boneless skinless chicken thighs"),
        ),
        (
            "1 pound rigatoni or another ridged dried pasta, or fresh pappardelle or tagliatelle",
            (
                "1 pound",
                "rigatoni or another ridged dried pasta, or fresh pappardelle or tagliatelle",
            ),
        ),
        (
            "Chopped fresh parsley, for serving (optional)",
            ("", "Chopped fresh parsley, for serving (optional)"),
        ),
        ("Pinch of ground cardamom", ("Pinch of", "ground cardamom")),
    ],
)
def test_parse_quantity_name(ingredient: str, expected: tuple[str, str]) -> None:
    assert parse_quantity_name(ingredient) == expected


@pytest.mark.parametrize(
    "ingredient,expected",
    [
        (
            "1 cup plain whole-milk yogurt",
            IngredientResult(
                quantity="1 cup",
                name="plain whole-milk yogurt",
            ),
        ),
        (
            "fine sea salt",
            IngredientResult(
                quantity="some",
                name="fine sea salt",
            ),
        ),
        (
            "2 garlic cloves, grated",
            IngredientResult(quantity="2", name="garlic cloves", description="grated"),
        ),
        (
            "Chopped fresh parsley, for serving (optional)",
            IngredientResult(
                quantity="some",
                name="Chopped fresh parsley",
                description="for serving",
                optional=True,
            ),
        ),
        (
            "Pinch of ground cardamom (optional)",
            IngredientResult(
                quantity="Pinch of",
                name="ground cardamom",
                description="",
                optional=True,
            ),
        ),
    ],
)
def test_parse_ingredient(ingredient: str, expected: IngredientResult) -> None:
    assert parse_ingredient(ingredient) == expected
