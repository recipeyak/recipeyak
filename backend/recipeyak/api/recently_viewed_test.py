import pytest
from rest_framework import status
from rest_framework.test import APIClient

from recipeyak.models import Recipe, RecipeView, User


@pytest.mark.django_db
def test_recently_viewed(client: APIClient, user: User, recipe: Recipe) -> None:
    client.force_authenticate(user)

    assert RecipeView.objects.count() == 0

    res = client.get(f"/api/v1/recipes/{recipe.pk}/")

    assert res.status_code == status.HTTP_200_OK
    assert RecipeView.objects.count() == 1

    res = client.get("/api/v1/recipes/recently_viewed")
    assert len(res.json()) == 1
    assert res.json()[0]["id"] == recipe.pk
