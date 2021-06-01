from typing import Dict, Iterable

import pytest
import yaml
from django.test import Client
from django.urls import reverse

from core.models import User, Recipe

pytestmark = pytest.mark.django_db


@pytest.fixture
def c() -> Client:
    return Client()


def fields_in(data: Dict[str, object], fields: Iterable[str]) -> bool:
    for key, value in data.items():
        if key in fields:
            return True
        if isinstance(value, list):
            for x in value:
                if isinstance(x, dict) and fields_in(x, fields=fields):
                    return True
        elif isinstance(value, dict):
            if fields_in(value, fields=fields):
                return True
    return False


@pytest.mark.parametrize(
    "dict_,expected",
    [
        ({"id": 1}, True),
        ({"blah": 1}, False),
        ({"blah": 1, "hmm": [{"id": 1}]}, True),
        ({"blah": 1, "hmm": [{"blah": 1}]}, False),
        ({"blah": 1, "hmm": [{"blah": 1}], "owner": {"id": 1}}, True),
    ],
)
def test_fields_in(dict_: Dict[str, object], expected: bool) -> None:
    assert fields_in(dict_, fields=("id",)) == expected


def test_bulk_export_json(
    c: Client, user: User, user2: User, recipe: Recipe, recipe2: Recipe
) -> None:
    url = reverse("export-recipes", kwargs={"filetype": "json"})
    res = c.get(url)
    assert res.status_code == 302
    c.force_login(user)
    res = c.get(url)
    assert res.status_code == 200
    recipes = res.json()
    assert len(recipes) == 2, "user should have two recipes"
    recipe2.move_to(user2)
    res = c.get(url)
    assert len(res.json()) == 1, "user should only have their recipes"


def test_export_fields(
    c: Client, user: User, user2: User, recipe: Recipe, recipe2: Recipe
) -> None:
    """
    we don't want to return extraneous fields like position and id
    """
    url = reverse("export-recipes", kwargs={"filetype": "json"})
    c.force_login(user)
    res = c.get(url)
    assert res.status_code == 200
    recipes = res.json()
    assert not any(fields_in(r, fields=("id",)) for r in recipes)


@pytest.mark.parametrize("filetype", ["yaml", "yml"])
def test_bulk_export_yaml(
    c: Client, filetype: str, user: User, user2: User, recipe: Recipe, recipe2: Recipe,
) -> None:
    recipe2.move_to(user)
    url = reverse("export-recipes", kwargs={"filetype": filetype})
    res = c.get(url)
    assert res.status_code == 302
    c.force_login(user)
    res = c.get(url)
    assert res.status_code == 200
    assert "!!python/" not in res.content.decode(
        "utf-8"
    ), "we don't want python objects to be serialized"
    recipes = list(yaml.safe_load_all(res.content))
    assert len(recipes) == 2, "user should have two recipes"
    recipe2.move_to(user2)
    res = c.get(url)
    assert (
        len(list(yaml.safe_load_all(res.content))) == 1
    ), "user should only have their recipes"


def test_single_export_json(c: Client, user: User, recipe: Recipe) -> None:
    url = reverse("export-recipe", kwargs={"pk": recipe.id, "filetype": "json"})
    res = c.get(url)
    assert res.status_code == 302
    c.force_login(user)
    res = c.get(url)
    assert res.status_code == 200
    assert res.json().get("name") == recipe.name


@pytest.mark.parametrize("filetype", ["yaml", "yml"])
def test_single_export_yaml(
    c: Client, filetype: str, user: User, recipe: Recipe
) -> None:
    url = reverse("export-recipe", kwargs={"pk": recipe.id, "filetype": filetype})
    res = c.get(url)
    assert res.status_code == 302
    c.force_login(user)
    res = c.get(url)
    assert "!!python/" not in res.content.decode(
        "utf-8"
    ), "we don't want python objects to be serialized"
    assert res.status_code == 200
    assert next(yaml.safe_load_all(res.content)).get("name") == recipe.name
