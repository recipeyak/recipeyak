from datetime import date

import pytest
from django.test.client import Client

from recipeyak.models import Recipe, ScheduledRecipe, Team, User

pytestmark = pytest.mark.django_db


def test_deleting_scheduled_recipe(
    client: Client, user: User, team: Team, scheduled_recipe: ScheduledRecipe
) -> None:
    scheduled_recipe.team = team
    scheduled_recipe.save()
    url = f"/api/v1/calendar/{scheduled_recipe.id}/"
    client.force_login(user)
    res = client.delete(url)
    assert res.status_code == 204
    assert not ScheduledRecipe.objects.filter(id=scheduled_recipe.id).exists()


def test_removing_from_team_calendar(
    client: Client, user: User, team: Team, recipe: Recipe
) -> None:
    scheduled = recipe.schedule(on=date(1976, 1, 2), team=team, user=user)
    url = f"/api/v1/t/{team.pk}/calendar/{scheduled.id}/"
    client.force_login(user)
    res = client.delete(url)
    assert res.status_code == 204
    assert not ScheduledRecipe.objects.filter(id=scheduled.id).exists()
