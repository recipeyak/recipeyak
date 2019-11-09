from datetime import date, timedelta
from decimal import Decimal
from typing import List, Tuple

import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from core.cumin import (
    IngredientItem,
    IngredientList,
    Quantity,
    Unit,
    combine_ingredients,
)
from core.models import Ingredient, MyUser, Recipe

pytestmark = pytest.mark.django_db

url = "/api/v1/t/me/shoppinglist/"


def test_fetching_shoppinglist(client, user, recipe):

    client.force_authenticate(user)
    start = date(1976, 7, 6)
    end = start + timedelta(days=1)
    params = dict(start=start, end=end)

    res = client.get(url, params)
    assert res.status_code == status.HTTP_200_OK
    assert res.json() == {}

    recipe.schedule(user=user, on=start, count=2)

    res = client.get(url, params)
    assert res.status_code == status.HTTP_200_OK
    assert res.json() == {
        "egg": {"quantities": [{"quantity": "2", "unit": "POUND"}]},
        "soy sauce": {"quantities": [{"quantity": "4", "unit": "TABLESPOON"}]},
    }


def test_fetching_shoppinglist_with_team_recipe(client, team, user, recipe):

    client.force_authenticate(user)

    assert team.is_member(user)

    recipe = recipe.move_to(team)

    start = date(1976, 7, 6)
    end = start + timedelta(days=1)
    params = dict(start=start, end=end)

    res = client.get(url, params)
    assert res.status_code == status.HTTP_200_OK
    assert res.json() == {}

    recipe.schedule(user=user, on=start, count=2)

    res = client.get(url, params)
    assert res.status_code == status.HTTP_200_OK
    assert res.json() != []

    assert res.json() == {
        "egg": {"quantities": [{"quantity": "2", "unit": "POUND"}]},
        "soy sauce": {"quantities": [{"quantity": "4", "unit": "TABLESPOON"}]},
    }


def test_fetching_shoppinglist_with_invalid_dates(user, client):
    params = {"start": "", "end": "invalid date"}
    client.force_authenticate(user)
    res = client.get(url, params)
    assert res.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.parametrize("quantity", ["sprinkle", "some"])
def test_scheduling_multiple_times_some_ingredient(
    quantity: str, user: MyUser, client: APIClient
) -> None:
    """
    with an ingredient of quantity sprinkle that we add to the cart multiple
    times shouldn't become sprinklesprinklesprinkle
    """

    name = "Recipe name"
    author = "Recipe author"
    recipe = Recipe.objects.create(name=name, author=author, owner=user)

    Ingredient.objects.create(
        quantity=quantity, name="black pepper", position=10.0, recipe=recipe
    )

    start = date(1976, 7, 6)
    recipe.schedule(user=user, on=start, count=3)

    end = start + timedelta(days=1)
    params = dict(start=start, end=end)
    client.force_authenticate(user)
    res = client.get(url, params)
    assert res.status_code == status.HTTP_200_OK
    assert res.json() == {
        "black pepper": {"quantities": [{"quantity": "3", "unit": "SOME"}]}
    }


@pytest.mark.parametrize(
    "ingredients,expected",
    [
        (
            [("1/2", "lemon"), ("1", "lemon"), ("2", "lemons")],
            {
                "lemons": IngredientItem(
                    quantities=[Quantity(quantity=Decimal(3.5), unit=Unit.NONE)]
                )
            },
        ),
        (
            [("1", "bay leaf"), ("4", "bay leaves")],
            {
                "bay leaves": IngredientItem(
                    quantities=[Quantity(quantity=Decimal(5), unit=Unit.NONE)]
                )
            },
        ),
        (
            [("1", "large tomato"), ("2", "large tomatoes")],
            {
                "large tomatoes": IngredientItem(
                    quantities=[Quantity(quantity=Decimal(3), unit=Unit.NONE)]
                )
            },
        ),
        (
            [("4-5", "medium button mushrooms"), ("4-5", "medium button mushrooms")],
            {
                "medium button mushrooms": IngredientItem(
                    quantities=[Quantity(quantity=Decimal(10), unit=Unit.NONE)]
                )
            },
        ),
        (
            [
                ("1 tablespoon", "black pepper"),
                ("2 tablespoon", "black pepper"),
                ("sprinkle", "black pepper"),
                ("some", "black pepper"),
            ],
            {
                "black pepper": IngredientItem(
                    quantities=[
                        Quantity(quantity=Decimal(3), unit=Unit.TABLESPOON),
                        Quantity(quantity=Decimal(2), unit=Unit.SOME),
                    ]
                )
            },
        ),
        (
            [
                ("16", "basil leaves"),
                ("some", "basil leaves"),
                ("sprinkle", "basil leaves"),
            ],
            {
                "basil leaves": IngredientItem(
                    quantities=[
                        Quantity(quantity=Decimal(16), unit=Unit.NONE),
                        Quantity(quantity=Decimal(2), unit=Unit.SOME),
                    ]
                )
            },
        ),
        (
            [
                ("1 tablespoon", "extra-virgin olive oil"),
                ("8 tablespoons", "extra virgin olive oil"),
            ],
            {
                "extra virgin olive oil": IngredientItem(
                    quantities=[Quantity(quantity=Decimal(9), unit=Unit.TABLESPOON)]
                )
            },
        ),
        (
            [("1", "garlic clove")],
            {
                "garlic clove": IngredientItem(
                    quantities=[Quantity(quantity=Decimal(1), unit=Unit.NONE)]
                )
            },
        ),
        (
            [("8", "Garlic Cloves"), ("1", "garlic clove")],
            {
                "garlic cloves": IngredientItem(
                    quantities=[Quantity(quantity=Decimal(9), unit=Unit.NONE)]
                )
            },
        ),
        (
            [("2 Tablespoons", "scallions"), ("4", "scallions")],
            {
                "scallions": IngredientItem(
                    quantities=[
                        Quantity(quantity=Decimal(2), unit=Unit.TABLESPOON),
                        Quantity(quantity=Decimal(4), unit=Unit.NONE),
                    ]
                )
            },
        ),
        (
            [("2 tbs", "soy sauce")],
            {
                "soy sauce": IngredientItem(
                    quantities=[Quantity(quantity=Decimal(2), unit=Unit.TABLESPOON)]
                )
            },
        ),
        (
            [("2 lbs", "tomato"), ("1 kg", "tomato")],
            {
                "tomato": IngredientItem(
                    quantities=[
                        Quantity(
                            quantity=Decimal("4.204622864866847967783965457"),
                            unit=Unit.POUND,
                        )
                    ]
                )
            },
        ),
        (
            [("1 teaspoon + 1 Tablespoon", "ginger"), ("1 teaspoon", "Ginger")],
            {
                "ginger": IngredientItem(
                    quantities=[Quantity(quantity=Decimal(5), unit=Unit.TEASPOON)]
                )
            },
        ),
        (
            [("1/2 cup", "scallions")],
            {
                "scallions": IngredientItem(
                    quantities=[Quantity(quantity=Decimal(0.5), unit=Unit.CUP)]
                )
            },
        ),
        (
            [("½ cup", "scallions")],
            {
                "scallions": IngredientItem(
                    quantities=[Quantity(quantity=Decimal(0.5), unit=Unit.CUP)]
                )
            },
        ),
        (
            [
                ("2", "lemons"),
                ("1", "lemon"),
                ("1 large", "lemon"),
                ("1/2", "lemon"),
                ("some", "lemon"),
            ],
            {
                "lemons": IngredientItem(
                    quantities=[
                        Quantity(quantity=Decimal(4.5), unit=Unit.NONE),
                        Quantity(quantity=Decimal(1), unit=Unit.SOME),
                    ]
                )
            },
        ),
    ],
)
def test_combine_ingredients(
    empty_recipe, ingredients: List[Tuple[str, str]], expected: IngredientList
) -> None:
    ingres = []
    position = 1
    for quantity, name in ingredients:
        ingres.append(
            Ingredient.objects.create(
                quantity=quantity, name=name, position=position, recipe=empty_recipe
            )
        )
        position += 1

    assert combine_ingredients(ingres) == expected


def test_report_bad_merge(user, client, recipe):
    url = reverse("report-bad-merge")
    assert client.post(url).status_code == status.HTTP_403_FORBIDDEN

    client.force_authenticate(user)
    assert client.post(url).status_code == status.HTTP_201_CREATED


def test_combining_feta(user, client, empty_recipe):
    """
    ensure the singularize function doesn't result in feta becoming fetum along
    with some other troublesome examples
    """

    position = 11.0

    ingredients = [
        ("some", "feta"),
        ("1.25 cups", "all-purpose flour"),
        ("some", "katamata olives"),
        ("some", "red pepper flakes"),
        ("2 tablespoon", "molasses"),
    ]

    for quantity, name in ingredients:
        Ingredient.objects.create(
            quantity=quantity, name=name, position=position, recipe=empty_recipe
        )
        position += 10

    start = date(1976, 7, 6)
    empty_recipe.schedule(user=user, on=start, count=1)

    end = start + timedelta(days=1)
    params = dict(start=start, end=end)
    client.force_authenticate(user)
    res = client.get(url, params)
    assert res.status_code == status.HTTP_200_OK

    assert res.json() == {
        "all purpose flour": {"quantities": [{"quantity": "1.25", "unit": "CUP"}]},
        "feta": {"quantities": [{"quantity": "1", "unit": "SOME"}]},
        "katamata olives": {"quantities": [{"quantity": "1", "unit": "SOME"}]},
        "molasses": {"quantities": [{"quantity": "2", "unit": "TABLESPOON"}]},
        "red pepper flakes": {"quantities": [{"quantity": "1", "unit": "SOME"}]},
    }
