from datetime import UTC, datetime, timedelta

import pytest
from rest_framework import status
from rest_framework.test import APIClient

from recipeyak.models import Recipe, Team, User

pytestmark = pytest.mark.django_db


def test_list_view(client: APIClient, user: User, team: Team, recipe: Recipe) -> None:
    client.force_authenticate(user)
    recipe.team = team
    recipe.save()

    res = client.get("/api/v1/recipes/")
    assert res.status_code == status.HTTP_200_OK
    assert res.json()[0]["scheduledCount"] == 0

    one_year_ago = datetime.now(tz=UTC) - timedelta(days=365 * 1)
    two_years_ago = datetime.now(tz=UTC) - timedelta(days=365 * 2)
    recipe.schedule(on=one_year_ago, user=user, team=team)
    recipe.schedule(on=two_years_ago, user=user, team=team)

    res = client.get("/api/v1/recipes/")
    assert res.status_code == status.HTTP_200_OK
    assert res.json()[0]["scheduledCount"] == 1


def test_list_view_no_ingredients_regression(
    client: APIClient, user: User, team: Team, recipe: Recipe
) -> None:
    client.force_authenticate(user)
    recipe.team = team
    recipe.save()
    recipe.ingredient_set.all().delete()

    res = client.get("/api/v1/recipes/")
    assert res.status_code == status.HTTP_200_OK
