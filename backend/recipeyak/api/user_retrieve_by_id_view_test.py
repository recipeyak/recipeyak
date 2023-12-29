import pytest
from rest_framework import status
from rest_framework.test import APIClient

from recipeyak.models import Recipe, Team, User

pytestmark = pytest.mark.django_db


def test_user_not_on_shared_team(
    client: APIClient, user: User, user2: User, team: Team, recipe: Recipe
) -> None:
    client.force_authenticate(user)
    res = client.get(f"/api/v1/user/{user.pk}/")
    assert res.status_code == status.HTTP_200_OK, "can fetch our own profile"
    assert res.json()["id"] == user.id

    res = client.get(f"/api/v1/user/{user2.pk}/")
    assert (
        res.status_code == status.HTTP_404_NOT_FOUND
    ), "cannot fetch a user on a different team"

    team.force_join(user2)
    res = client.get(f"/api/v1/user/{user2.pk}/")
    assert res.status_code == status.HTTP_200_OK, "can fetch when user joins team"
    assert res.json()["id"] == user2.id
