import pytest
from rest_framework.test import APIClient

from recipeyak.models import Recipe, User
from recipeyak.models.team import Team


@pytest.mark.django_db
def test_recently_viewed(
    client: APIClient, user: User, recipe: Recipe, team: Team
) -> None:
    recipe.team = team
    recipe.save()
    client.force_authenticate(user)
    res = client.get("/api/v1/recipes/recently_created")
    assert len(res.json()) == 1
    assert res.json()[0]["id"] == recipe.pk
