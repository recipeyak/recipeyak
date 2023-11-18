from datetime import date

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

    recipe.schedule(on=date(2020, 2, 10), user=user, team=team)

    res = client.get("/api/v1/recipes/")
    assert res.status_code == status.HTTP_200_OK
    assert res.json()[0]["scheduledCount"] == 1
