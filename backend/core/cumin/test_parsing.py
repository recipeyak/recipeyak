import json
from decimal import Decimal
from typing import Optional, Sequence, Tuple

import pytest

from core.cumin import (
    IncompatibleUnit,
    Ingredient,
    IngredientItem,
    IngredientList,
    Quantity,
    Unit,
    combine_ingredients,
    fraction_to_decimal,
    parse_quantity,
)
from core.renderers import JSONEncoder


@pytest.mark.parametrize(
    "quantity,expected",
    [
        ("1/2 Tablespoon", Quantity(quantity=Decimal(0.5), unit=Unit.TABLESPOON)),
        ("3 1/2 Tablespoon", Quantity(quantity=Decimal(3.5), unit=Unit.TABLESPOON)),
        ("1 tsp", Quantity(quantity=Decimal(1), unit=Unit.TEASPOON)),
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
        (
            "1 Tablespoon + 1 teaspoon",
            Quantity(quantity=Decimal(4), unit=Unit.TEASPOON),
        ),
        ("some", Quantity(quantity=Decimal(1), unit=Unit.SOME)),
        ("1", Quantity(quantity=Decimal(1), unit=Unit.NONE)),
    ],
)
def test_parsing_quantities(quantity: str, expected: Optional[Quantity]) -> None:
    assert parse_quantity(quantity) == expected


@pytest.mark.parametrize(
    "fraction,expected",
    [("1/2", Decimal(0.5)), ("11/2", Decimal(5.5)), ("1 1/2", Decimal(1.5))],
)
def test_fraction_to_decimal(fraction: str, expected: Optional[Decimal]) -> None:
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
    ],
)
def test_quantity_addition(
    quantities: Tuple[Quantity, Quantity], expected: Quantity
) -> None:
    a, b = quantities
    assert a + b == expected


def test_adding_incompatible_units() -> None:
    """
    MASS and VOLUME units should raise an error on addition. We handle this
    error higher up.
    """
    with pytest.raises(IncompatibleUnit):
        # pylint:disable=expression-not-assigned
        Quantity(quantity=Decimal(1), unit=Unit.TABLESPOON) + Quantity(
            quantity=Decimal(2), unit=Unit.GRAM
        )


@pytest.mark.parametrize(
    "ingredients,expected",
    [
        (
            [
                Ingredient(quantity="1 teaspoon", name="Soy Sauce"),
                Ingredient(quantity="1 tablespoon", name="soy sauce"),
                Ingredient(quantity="some", name="Soy Sauce"),
            ],
            {
                "soy sauce": IngredientItem(
                    quantities=[
                        Quantity(quantity=Decimal(4), unit=Unit.TEASPOON),
                        Quantity(quantity=Decimal(1), unit=Unit.SOME),
                    ]
                )
            },
        ),
        (
            [
                Ingredient(quantity="1 cup", name="flour"),
                Ingredient(quantity="some", name="flour"),
                Ingredient(quantity="250 gram", name="flour"),
                Ingredient(quantity="2 cup", name="flour"),
            ],
            {
                "flour": IngredientItem(
                    quantities=[
                        # mass != volume so we get two separate quantities
                        Quantity(quantity=Decimal(3), unit=Unit.CUP),
                        Quantity(quantity=Decimal(1), unit=Unit.SOME),
                        Quantity(quantity=Decimal(250), unit=Unit.GRAM),
                    ]
                )
            },
        ),
    ],
)
def test_combining_ingredients(
    ingredients: Sequence[Ingredient], expected: IngredientList
) -> None:
    assert combine_ingredients(ingredients) == expected


def test_combining_ingredients_to_json() -> None:
    ingredients = [
        Ingredient(quantity="1 teaspoon", name="Soy Sauce"),
        Ingredient(quantity="1 tablespoon", name="soy sauce"),
        Ingredient(quantity="some", name="Soy Sauce"),
    ]

    assert json.loads(
        json.dumps(combine_ingredients(ingredients), cls=JSONEncoder)
    ) == {
        "soy sauce": {
            "quantities": [
                {"quantity": "4", "unit": "TEASPOON"},
                {"quantity": "1", "unit": "SOME"},
            ]
        }
    }
