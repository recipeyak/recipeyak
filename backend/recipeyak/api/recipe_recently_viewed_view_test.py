import pytest
from rest_framework.test import APIClient

from recipeyak.models import Recipe, RecipeView, User
from recipeyak.models.team import Team


@pytest.mark.django_db
def test_recently_viewed(
    client: APIClient, user: User, recipe: Recipe, team: Team
) -> None:
    client.force_authenticate(user)
    recipe.team = team
    recipe.save()

    assert RecipeView.objects.count() == 0

    res = client.get(f"/api/v1/recipes/{recipe.pk}/")

    assert res.status_code == 200
    assert RecipeView.objects.count() == 1

    res = client.get("/api/v1/recipes/recently_viewed")
    assert len(res.json()) == 1
    assert res.json()[0]["id"] == recipe.pk
