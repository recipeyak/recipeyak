import pytest
from rest_framework import status
from rest_framework.test import APIClient

from recipeyak.models import Recipe, Step, User
from recipeyak.models.team import Team

pytestmark = pytest.mark.django_db


def test_accessing_recipes(
    client: APIClient, user: User, recipe: Recipe, user2: User, team: Team
) -> None:
    """
    ensure a user can only access their own recipes
    """
    client.force_authenticate(user)

    recipe.team = team
    recipe.save()

    res = client.get(f"/api/v1/recipes/{recipe.id}/")
    assert res.status_code == status.HTTP_200_OK

    client.force_authenticate(user2)

    res = client.get(f"/api/v1/recipes/{recipe.id}/")
    assert res.status_code == status.HTTP_404_NOT_FOUND

    client.force_authenticate(None)

    res = client.get(f"/api/v1/recipes/{recipe.id}/")
    assert res.status_code == status.HTTP_403_FORBIDDEN
