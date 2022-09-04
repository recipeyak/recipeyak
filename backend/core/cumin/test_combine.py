import json
from decimal import Decimal
from typing import Sequence

import pytest

from core.cumin.combine import (
    Ingredient,
    IngredientItem,
    IngredientList,
    Quantity,
    combine_ingredients,
)
from core.cumin.quantity import (
    Unit,
)

from core.renderers import JSONRenderer


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

    assert json.loads(JSONRenderer().render(combine_ingredients(ingredients))) == {
        "soy sauce": {
            "category": None,
            "quantities": [
                {"quantity": "4", "unit": "TEASPOON", "unknown_unit": None},
                {"quantity": "1", "unit": "SOME", "unknown_unit": None},
            ],
        }
    }
