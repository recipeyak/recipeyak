from typing import Iterator
from unittest.mock import patch

import pytest
from rest_framework import status
from rest_framework.test import APIClient

from recipeyak.models import (
    Recipe,
    RecipeCookChecklistCheck,
    Team,
    User,
)

pytestmark = pytest.mark.django_db


@pytest.fixture()
def patch_publish_calendar_event() -> Iterator[None]:
    with patch("recipeyak.realtime.publish_cook_checklist", return_value=None):
        yield


def test_fetch_checklist(
    client: APIClient,
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
    client.force_authenticate(user)
    res = client.get(url)
    assert res.status_code == status.HTTP_200_OK

    for ingredient_id in recipe.ingredient_set.values_list("id", flat=True):
        assert (
            type(res.json()[str(ingredient_id)]) == bool
        ), "shape should be str -> bool"


def test_update_checklist(
    client: APIClient,
    user: User,
    team: Team,
    recipe: Recipe,
    patch_publish_calendar_event: object,
) -> None:
    recipe.team = team
    recipe.save()
    ingredient = recipe.ingredient_set.all()[0]

    url = f"/api/v1/cook-checklist/{recipe.id}/"
    client.force_authenticate(user)
    res = client.post(url, {"ingredient_id": ingredient.id, "checked": False})
    assert res.status_code == status.HTTP_200_OK
    assert res.json() == {"ingredient_id": ingredient.id, "checked": False}

    res = client.get(url)
    assert res.json()[str(ingredient.id)] is False

    res = client.post(url, {"ingredient_id": ingredient.id, "checked": True})
    assert res.status_code == status.HTTP_200_OK

    res = client.get(url)
    assert res.json()[str(ingredient.id)] is True
