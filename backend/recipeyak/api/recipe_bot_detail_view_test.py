import pytest
from rest_framework import status
from rest_framework.test import APIClient

from recipeyak.models import Recipe, User

pytestmark = pytest.mark.django_db


def test_bot_detail_view(client: APIClient, user: User, recipe: Recipe) -> None:
    client.force_authenticate(user)

    res = client.get(f"/api/v1/bot-recipes/{recipe.id}")
    assert res.status_code == status.HTTP_200_OK
    assert "og:title" in res.content.decode()
    assert recipe.name in res.content.decode()

    res = client.get(f"/api/v1/bot-recipes/{recipe.id}-some-title")
    assert res.status_code == status.HTTP_200_OK
    assert "og:title" in res.content.decode()
