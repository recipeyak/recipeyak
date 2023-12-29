from datetime import date

import pytest
from django.test.client import Client

from recipeyak.models import Recipe, ScheduledRecipe, Team, User

pytestmark = pytest.mark.django_db


def test_creating_scheduled_recipe(
    client: Client, recipe: Recipe, team: Team, user: User
) -> None:
    recipe.team = team
    recipe.save()
    url = f"/api/v1/t/{team.id}/calendar/"
    data = {"recipe": recipe.id, "on": date(1976, 7, 6)}
    client.force_login(user)
    res = client.post(url, data, content_type="application/json")
    assert res.status_code == 201
    assert ScheduledRecipe.objects.filter(id=res.json()["id"]).exists()
    assert res.json()[
        "created"
    ], "ensure we have the created at property for sorting on the frontend"


def test_adding_to_team_calendar(
    client: Client, user: User, team: Team, recipe: Recipe
) -> None:
    url = f"/api/v1/t/{team.pk}/calendar/"
    recipe.team = team
    recipe.save()
    data = {"recipe": recipe.id, "on": date(1976, 7, 6)}
    assert team.is_member(user)
    client.force_login(user)
    res = client.post(url, data, content_type="application/json")
    assert res.status_code == 201
    scheduled = ScheduledRecipe.objects.get(id=res.json().get("id"))
    assert scheduled.team is not None and scheduled.team.pk == team.pk
