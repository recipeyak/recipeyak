import pytest
from rest_framework import status
from rest_framework.test import APIClient

from recipeyak.models import Recipe, Step, User

pytestmark = pytest.mark.django_db


def test_accessing_recipes(
    client: APIClient, user: User, recipe: Recipe, user2: User
) -> None:
    """
    ensure a user can only access their own recipes
    """
    client.force_authenticate(user)

    res = client.get(f"/api/v1/recipes/{recipe.id}/")
    assert res.status_code == status.HTTP_200_OK

    client.force_authenticate(user2)

    res = client.get(f"/api/v1/recipes/{recipe.id}/")
    assert res.status_code == status.HTTP_404_NOT_FOUND

    client.force_authenticate(None)

    res = client.get(f"/api/v1/recipes/{recipe.id}/")
    assert res.status_code == status.HTTP_403_FORBIDDEN


def test_accessing_step_of_other_user(
    client: APIClient, recipe: Recipe, user2: User
) -> None:
    """
    ensure 404 when access other user's step
    """

    step = Step.objects.get(recipe=recipe)

    client.force_authenticate(user2)

    res = client.get(f"/api/v1/steps/{step.id}/")
    assert res.status_code == status.HTTP_404_NOT_FOUND

    client.force_authenticate(None)

    res = client.get(f"/api/v1/steps/{step.id}/")
    assert res.status_code == status.HTTP_404_NOT_FOUND