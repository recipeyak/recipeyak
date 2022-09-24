from __future__ import annotations

import pytest
import yaml
from django.test import Client

from core.models import Recipe, User

pytestmark = pytest.mark.django_db


@pytest.fixture
def c() -> Client:
    return Client()


def test_bulk_export_json(
    c: Client, user: User, user2: User, recipe: Recipe, recipe2: Recipe
) -> None:
    url = "/recipes.json"
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


@pytest.mark.parametrize("filetype", ["yaml", "yml"])
def test_bulk_export_yaml(
    c: Client,
    filetype: str,
    user: User,
    user2: User,
    recipe: Recipe,
    recipe2: Recipe,
) -> None:
    recipe2.move_to(user)
    url = f"/recipes.{filetype}"
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
    url = f"/recipes/{recipe.id}.json"
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
    url = f"/recipes/{recipe.id}.{filetype}"
    res = c.get(url)
    assert res.status_code == 302
    c.force_login(user)
    res = c.get(url)
    assert "!!python/" not in res.content.decode(
        "utf-8"
    ), "we don't want python objects to be serialized"
    assert res.status_code == 200
    assert next(yaml.safe_load_all(res.content)).get("name") == recipe.name


def test_unicode_issues(c: Client, user: User, recipe: Recipe) -> None:
    """
    regression to prevent unicode encoding issues with pyyaml
    """
    recipe.name = "foo 🦠"
    recipe.tags = ["foo", "bar"]
    recipe.save()
    url = f"/recipes/{recipe.id}.yaml"
    c.force_login(user)
    res = c.get(url)
    assert (
        res.content.decode()
        == f"""\
id: {recipe.id}
name: foo 🦠
author: Recipe author
time: 1 hour
source: www.exmple.com
servings: null
ingredients:
- quantity: 1 lbs
  name: egg
  description: scrambled
  optional: false
- quantity: 2 tbs
  name: soy sauce
  description: ''
  optional: false
steps:
- Place egg in boiling water and cook for ten minutes
owner:
  user: john@doe.org
tags:
- foo
- bar
"""
    )
