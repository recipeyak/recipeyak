import pytest
from typing import Dict, List, Union

from django.urls import reverse
from rest_framework import status
from datetime import date, timedelta
from rest_framework.test import APIClient

from .utils import combine_ingredients, simplify_units, unicode_fractions_to_ascii
from core.models import Recipe, Ingredient, MyUser

pytestmark = pytest.mark.django_db


def omit(d: Union[Dict, List], keys=[]) -> Union[List[Dict], Dict]:
    if isinstance(d, list):
        return [{k: v for k, v in i.items() if k not in keys} for i in d]
    return {k: v for k, v in d.items() if k not in keys}


def test_fetching_shoppinglist(client, user, recipe):

    client.force_authenticate(user)
    start = date(1976, 7, 6)
    end = start + timedelta(days=1)
    params = dict(start=start, end=end)

    shoppinglist_url = reverse("shopping-list")
    res = client.get(shoppinglist_url, params)
    assert res.status_code == status.HTTP_200_OK
    assert res.json() == []

    recipe.schedule(user=user, on=start, count=2)

    res = client.get(shoppinglist_url, params)
    assert res.status_code == status.HTTP_200_OK
    assert res.json() != []

    assert omit(res.json(), "origin") == [
        dict(unit="2 pound", name="egg"),
        dict(unit="4 tablespoon", name="soy sauce"),
    ]


def test_fetching_shoppinglist_with_team_recipe(client, team, user, recipe):

    client.force_authenticate(user)

    assert team.is_member(user)

    recipe = recipe.move_to(team)

    start = date(1976, 7, 6)
    end = start + timedelta(days=1)
    params = dict(start=start, end=end)

    url = reverse("shopping-list")
    res = client.get(url, params)
    assert res.status_code == status.HTTP_200_OK
    assert res.json() == []

    recipe.schedule(user=user, on=start, count=2)

    res = client.get(url, params)
    assert res.status_code == status.HTTP_200_OK
    assert res.json() != []

    assert omit(res.json(), "origin") == [
        dict(unit="2 pound", name="egg"),
        dict(unit="4 tablespoon", name="soy sauce"),
    ]


def test_fetching_shoppinglist_with_invalid_dates(user, client):
    params = {"start": '', "end": "invalid date"}
    url = reverse("shopping-list")
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
    url = reverse("shopping-list")
    client.force_authenticate(user)
    res = client.get(url, params)
    assert res.status_code == status.HTTP_200_OK
    assert res.json()[0].get("unit") == "some"


@pytest.mark.parametrize(
    "ingredients,combined",
    [
        ([("1/2", "lemon"), ("1", "lemon"), ("2", "lemons")], ("3.5", "lemons")),
        ([("1", "bay leaf"), ("4", "bay leaves")], ("5", "bay leaves")),
        ([("1", "large tomato"), ("2", "large tomatoes")], ("3", "large tomatoes")),
        (
            [("4-5", "medium button mushrooms"), ("4-5", "medium button mushrooms")],
            ("10", "medium button mushrooms"),
        ),
        (
            [
                ("1 tablespoon", "black pepper"),
                ("2 tablespoon", "black pepper"),
                ("sprinkle", "black pepper"),
                ("some", "black pepper"),
            ],
            ("3 tablespoon + some", "black pepper"),
        ),
        (
            [
                ("16", "basil leaves"),
                ("some", "basil leaves"),
                ("sprinkle", "basil leaves"),
            ],
            ("16 + some", "basil leaves"),
        ),
        (
            [
                ("1 tablespoon", "extra-virgin olive oil"),
                ("8 tablespoons", "extra virgin olive oil"),
            ],
            ("9 tablespoon", "extra virgin olive oil"),
        ),
        ([("1", "garlic clove")], ("1", "garlic clove")),
        ([("8", "Garlic Cloves"), ("1", "garlic clove")], ("9", "garlic cloves")),
        (
            [("2 Tablespoons", "scallions"), ("4", "scallions")],
            ("2 tablespoon + 4", "scallions"),
        ),
        ([("2 tbs", "soy sauce")], ("2 tablespoon", "soy sauce")),
        (
            [("2 lbs", "tomato"), ("1 kg", "tomato")],
            ("4.204622621848776 pound", "tomato"),
        ),
        (
            [("1 teaspoon + 1 Tablespoon", "soy sauce"), ("1 teaspoon", "Soy Sauce")],
            ("5.0 teaspoon", "soy sauce"),
        ),
        ([("1/2 cup", "scallions")], ("0.5 cup", "scallions")),
        ([("½ cup", "scallions")], ("0.5 cup", "scallions")),
    ],
)
def test_combine_ingredients(empty_recipe, ingredients, combined):
    ingres = []
    position = 1
    for quantity, name in ingredients:
        ingres.append(
            Ingredient.objects.create(
                quantity=quantity, name=name, position=position, recipe=empty_recipe
            )
        )
        position += 1

    unit, name = combined
    assert omit(combine_ingredients(ingres), "origin") == [dict(name=name, unit=unit)]


@pytest.mark.parametrize(
    "input_str,expected", [("½ cup", "1/2 cup"), ("⅒ gram", "1/10 gram")]
)
def test_unicode_fractions_to_ascii(input_str: str, expected: str) -> None:
    assert unicode_fractions_to_ascii(input_str) == expected


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
    url = reverse("shopping-list")
    res = client.get(url, params)
    assert res.status_code == status.HTTP_200_OK

    for processed, (_, name) in zip(res.json(), ingredients):
        assert processed.get("name") == name


def test_simplify_units():
    assert simplify_units(["tablespoon", "some", "sprinkle", "pinch"]) == [
        "tablespoon",
        "some",
    ]
