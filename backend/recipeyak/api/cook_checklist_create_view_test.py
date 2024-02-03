import pytest
from django.test.client import Client

from recipeyak.models import (
    Recipe,
    RecipeCookChecklistCheck,
    Team,
    User,
)

pytestmark = pytest.mark.django_db


def test_fetch_checklist(
    client: Client,
    user: User,
    team: Team,
    recipe: Recipe,
) -> None:
    recipe.team = team
    recipe.save()
    RecipeCookChecklistCheck.objects.bulk_create(
        RecipeCookChecklistCheck(
            checked=index % 2, recipe=recipe, ingredient=ingredient
        )
        for index, ingredient in enumerate(recipe.ingredient_set.all())
    )
    url = f"/api/v1/cook-checklist/{recipe.id}/"
    client.force_login(user)
    res = client.get(url)
    assert res.status_code == 200

    for ingredient_id in recipe.ingredient_set.values_list("id", flat=True):
        assert isinstance(
            res.json()[str(ingredient_id)], bool
        ), "shape should be str -> bool"


def test_update_checklist(
    client: Client,
    user: User,
    team: Team,
    recipe: Recipe,
) -> None:
    recipe.team = team
    recipe.save()
    ingredient = recipe.ingredient_set.all()[0]

    url = f"/api/v1/cook-checklist/{recipe.id}/"
    client.force_login(user)
    res = client.post(
        url,
        {"ingredient_id": ingredient.id, "checked": False},
        content_type="application/json",
    )
    assert res.status_code == 200
    assert res.json() == {"ingredient_id": ingredient.id, "checked": False}

    res = client.get(url)
    assert res.json()[str(ingredient.id)] is False

    res = client.post(
        url,
        {"ingredient_id": ingredient.id, "checked": True},
        content_type="application/json",
    )
    assert res.status_code == 200

    res = client.get(url)
    assert res.json()[str(ingredient.id)] is True
