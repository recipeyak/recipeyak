import json
from datetime import date, timedelta
from decimal import Decimal

import pytest
from django.test.client import Client

from recipeyak.cumin.combine import Ingredient as IngredientCumin
from recipeyak.cumin.combine import (
    IngredientItem,
    IngredientList,
    Quantity,
    combine_ingredients,
)
from recipeyak.cumin.quantity import Unit
from recipeyak.models import Ingredient, Recipe, ShoppingList, Team, User

pytestmark = pytest.mark.django_db


def test_fetching_shoppinglist(
    client: Client, user: User, team: Team, recipe: Recipe
) -> None:
    assert ShoppingList.objects.count() == 0

    client.force_login(user)
    start = date(1976, 7, 6)
    end = start + timedelta(days=1)
    params = {"start": start, "end": end}

    res = client.get("/api/v1/shoppinglist/", params)
    assert res.status_code == 200
    assert res.json()["ingredients"] == {}
    assert ShoppingList.objects.count() == 1

    recipe.schedule(user=user, on=start, team=team)

    res = client.get("/api/v1/shoppinglist/", params)
    assert res.status_code == 200
    assert res.json()["ingredients"] == {
        "egg": {
            "category": "dairy",
            "quantities": [{"quantity": "1", "unit": "POUND", "unknown_unit": None}],
        },
        "soy sauce": {
            "category": "condiments",
            "quantities": [
                {"quantity": "2", "unit": "TABLESPOON", "unknown_unit": None}
            ],
        },
    }

    assert ShoppingList.objects.count() == 2
    shopping_list = ShoppingList.objects.order_by("-created").first()
    assert shopping_list is not None
    assert json.loads(shopping_list.ingredients) == res.json()["ingredients"]


def test_fetching_shoppinglist_with_team_recipe(
    client: Client, team: Team, user: User, recipe: Recipe
) -> None:
    client.force_login(user)

    assert team.is_member(user)

    start = date(1976, 7, 6)
    end = start + timedelta(days=1)
    params = {"start": start, "end": end}

    res = client.get("/api/v1/shoppinglist/", params)
    assert res.status_code == 200
    assert res.json()["ingredients"] == {}

    recipe.schedule(user=user, on=start, team=team)

    res = client.get("/api/v1/shoppinglist/", params)
    assert res.status_code == 200
    assert res.json()["ingredients"] != []

    assert res.json()["ingredients"] == {
        "egg": {
            "category": "dairy",
            "quantities": [{"quantity": "1", "unit": "POUND", "unknown_unit": None}],
        },
        "soy sauce": {
            "category": "condiments",
            "quantities": [
                {"quantity": "2", "unit": "TABLESPOON", "unknown_unit": None}
            ],
        },
    }


def test_fetching_shoppinglist_with_invalid_dates(
    user: User, team: Team, client: Client
) -> None:
    params = {"start": "", "end": "invalid date"}
    client.force_login(user)
    res = client.get("/api/v1/shoppinglist/", params)
    assert res.status_code == 400


@pytest.mark.parametrize("quantity", ["sprinkle", "some"])
def test_scheduling_multiple_times_some_ingredient(
    quantity: str, user: User, team: Team, client: Client
) -> None:
    """
    with an ingredient of quantity sprinkle that we add to the cart multiple
    times shouldn't become sprinklesprinklesprinkle
    """

    name = "Recipe name"
    author = "Recipe author"
    recipe = Recipe.objects.create(name=name, author=author, team=team)

    Ingredient.objects.create(
        quantity=quantity, name="black pepper", position=10.0, recipe=recipe
    )

    start = date(1976, 7, 6)
    recipe.schedule(user=user, on=start, team=team)

    end = start + timedelta(days=1)
    params = {"start": start, "end": end}
    client.force_login(user)
    res = client.get("/api/v1/shoppinglist/", params)
    assert res.status_code == 200
    assert res.json()["ingredients"] == {
        "black pepper": {
            "category": "spices",
            "quantities": [{"quantity": "1", "unit": "SOME", "unknown_unit": None}],
        }
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
    ingredients: list[tuple[str, str]], expected: IngredientList
) -> None:
    ingres = []
    position = 1
    for quantity, name in ingredients:
        ingres.append(IngredientCumin(quantity=quantity, name=name))
        position += 1

    assert combine_ingredients(ingres) == expected


def test_combining_feta(user: User, team: Team, client: Client) -> None:
    """
    ensure the singularize function doesn't result in feta becoming fetum along
    with some other troublesome examples
    """

    name = "empty recipe"
    empty_recipe = Recipe.objects.create(name=name, team=team)

    position = 11.0

    ingredients = [
        ("some", "feta"),
        ("1.25 cups", "all-purpose flour"),
        ("some", "katamata olives"),
        ("some", "red pepper flakes"),
        ("2 tablespoon", "molasses"),
        # duplicate the ingredient to replicate scheduling the recipe multiple
        # times
        ("1 bag", "tortilla chips"),
        ("1 bag", "tortilla chips"),
        ("1 container", "tortilla chips"),
    ]

    for quantity, name in ingredients:
        Ingredient.objects.create(
            quantity=quantity, name=name, position=position, recipe=empty_recipe
        )
        position += 10

    start = date(1976, 7, 6)
    empty_recipe.schedule(user=user, on=start, team=team)

    end = start + timedelta(days=1)
    params = {"start": start, "end": end}
    client.force_login(user)
    res = client.get("/api/v1/shoppinglist/", params)
    assert res.status_code == 200

    assert res.json()["ingredients"] == {
        "all purpose flour": {
            "category": "baking",
            "quantities": [{"quantity": "1.25", "unit": "CUP", "unknown_unit": None}],
        },
        "feta": {
            "category": "cheese",
            "quantities": [{"quantity": "1", "unit": "SOME", "unknown_unit": None}],
        },
        "katamata olives": {
            "category": "condiments",
            "quantities": [{"quantity": "1", "unit": "SOME", "unknown_unit": None}],
        },
        "molasses": {
            "category": "baking",
            "quantities": [
                {"quantity": "2", "unit": "TABLESPOON", "unknown_unit": None}
            ],
        },
        "red pepper flakes": {
            "category": "spices",
            "quantities": [{"quantity": "1", "unit": "SOME", "unknown_unit": None}],
        },
        "tortilla chips": {
            "category": "dry goods",
            "quantities": [
                {"quantity": "2", "unit": "UNKNOWN", "unknown_unit": "bag"},
                {"quantity": "1", "unit": "UNKNOWN", "unknown_unit": "container"},
            ],
        },
    }


def test_fetching_team_shopping_list(
    client: Client, user: User, team: Team, recipe: Recipe
) -> None:
    start = date(1976, 7, 6)
    end = start + timedelta(days=1)
    params = {"start": start, "end": end}

    url = "/api/v1/shoppinglist/"
    client.force_login(user)
    res = client.get(url, params)
    assert res.status_code == 200
    assert res.json()["ingredients"] == {}

    recipe.schedule(on=start, team=team, user=user)
    res = client.get(url, params)
    assert res.status_code == 200
    assert len(res.json()["ingredients"]) == (
        recipe.ingredient_set.count()
    ), "only return the schedule recipe ingredients"
