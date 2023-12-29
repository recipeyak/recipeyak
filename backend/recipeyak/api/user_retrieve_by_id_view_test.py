import pytest
from django.test.client import Client
from rest_framework import status

from recipeyak.models import Recipe, Team, User

pytestmark = pytest.mark.django_db


def test_user_not_on_shared_team(
    user: User, user2: User, team: Team, recipe: Recipe
) -> None:
    c = Client()
    # need auth
    res = c.get(f"/api/v1/user/{user.pk}/")
    assert res.status_code == 403, "auth required"

    c.force_login(user)
    res = c.get(f"/api/v1/user/{user.pk}/")
    assert res.status_code == status.HTTP_200_OK, "can fetch our own profile"
    assert res.json()["id"] == user.id

    res = c.get(f"/api/v1/user/{user2.pk}/")
    assert (
        res.status_code == status.HTTP_404_NOT_FOUND
    ), "cannot fetch a user on a different team"

    team.force_join(user2)
    res = c.get(f"/api/v1/user/{user2.pk}/")
    assert res.status_code == status.HTTP_200_OK, "can fetch when user joins team"
    assert res.json()["id"] == user2.id
