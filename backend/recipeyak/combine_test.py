from collections.abc import Sequence
from decimal import Decimal

import pytest

from recipeyak.combine import (
    Ingredient,
    Quantity,
    combine_ingredients,
)
from recipeyak.parsing import Unit


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
                "soy sauce": [
                    Quantity(quantity=Decimal(4), unit=Unit.TEASPOON),
                    Quantity(quantity=Decimal(1), unit=Unit.SOME),
                ]
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
                "flour": [
                    # mass != volume so we get two separate quantities
                    Quantity(quantity=Decimal(3), unit=Unit.CUP),
                    Quantity(quantity=Decimal(1), unit=Unit.SOME),
                    Quantity(quantity=Decimal(250), unit=Unit.GRAM),
                ]
            },
        ),
    ],
)
def test_combining_ingredients(
    ingredients: Sequence[Ingredient], expected: dict[str, list[Quantity]]
) -> None:
    assert combine_ingredients(ingredients) == expected
