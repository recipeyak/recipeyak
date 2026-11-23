import pytest
from django.test.client import Client

from recipeyak.models import Recipe, RecipeView, User
from recipeyak.models.team import Team


@pytest.mark.django_db
def test_recently_viewed(
    client: Client, user: User, recipe: Recipe, team: Team
) -> None:
    client.force_login(user)
    recipe.team = team
    recipe.save()

    assert RecipeView.objects.count() == 0

    # Fetching a recipe (e.g. a prefetch) doesn't count as a view.
    res = client.get(f"/api/v1/recipes/{recipe.pk}/")
    assert res.status_code == 200
    assert RecipeView.objects.count() == 0

    res = client.post(
        f"/api/v1/recipes/{recipe.pk}/view", content_type="application/json"
    )
    assert res.status_code == 204
    assert RecipeView.objects.count() == 1

    res = client.get("/api/v1/recipes/recently_viewed")
    assert len(res.json()) == 1
    assert res.json()[0]["id"] == recipe.pk
