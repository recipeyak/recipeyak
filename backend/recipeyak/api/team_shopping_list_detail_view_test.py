from datetime import date, timedelta

import pytest
from rest_framework import status
from rest_framework.test import APIClient

from recipeyak.models import Recipe, Team, User

pytestmark = pytest.mark.django_db


def test_fetching_team_shopping_list(
    client: APIClient, user: User, team: Team, recipe: Recipe
) -> None:
    start = date(1976, 7, 6)
    end = start + timedelta(days=1)
    params = {"start": start, "end": end}

    url = f"/api/v1/t/{team.pk}/shoppinglist/"
    client.force_authenticate(user)
    res = client.get(url, params)
    assert res.status_code == status.HTTP_200_OK
    assert res.json() == {}

    recipe.schedule(on=start, team=team, user=user)
    res = client.get(url, params)
    assert res.status_code == status.HTTP_200_OK
    assert len(res.json()) == len(
        recipe.ingredients
    ), "only return the schedule recipe ingredients"
