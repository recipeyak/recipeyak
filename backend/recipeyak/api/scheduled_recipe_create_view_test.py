from datetime import date

import pytest
from rest_framework import status
from rest_framework.test import APIClient

from recipeyak.models import Recipe, ScheduledRecipe, Team, User

pytestmark = pytest.mark.django_db


def test_creating_scheduled_recipe(
    client: APIClient, recipe: Recipe, team: Team, user: User
) -> None:
    recipe.team = team
    recipe.save()
    url = f"/api/v1/t/{team.id}/calendar/"
    data = {"recipe": recipe.id, "on": date(1976, 7, 6)}
    client.force_login(user)
    res = client.post(url, data)
    assert res.status_code == status.HTTP_201_CREATED
    assert ScheduledRecipe.objects.filter(id=res.json()["id"]).exists()
    assert res.json()[
        "created"
    ], "ensure we have the created at property for sorting on the frontend"


def test_adding_to_team_calendar(
    client: APIClient, user: User, team: Team, recipe: Recipe
) -> None:
    url = f"/api/v1/t/{team.pk}/calendar/"
    recipe.team = team
    recipe.save()
    data = {"recipe": recipe.id, "on": date(1976, 7, 6)}
    assert team.is_member(user)
    client.force_login(user)
    res = client.post(url, data)
    assert res.status_code == status.HTTP_201_CREATED
    scheduled = ScheduledRecipe.objects.get(id=res.json().get("id"))
    assert scheduled.team is not None and scheduled.team.pk == team.pk
