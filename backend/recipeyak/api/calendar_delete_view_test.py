import pytest
from django.test.client import Client

from recipeyak.models import ScheduledRecipe, Team, User

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
