import pytest
from django.test.client import Client

from recipeyak.models import Recipe, User

pytestmark = pytest.mark.django_db


def test_bot_detail_view(client: Client, user: User, recipe: Recipe) -> None:
    client.force_login(user)

    res = client.get(f"/api/v1/bot-recipes/{recipe.id}")
    assert res.status_code == 200
    assert "og:title" in res.content.decode()
    assert recipe.name in res.content.decode()

    res = client.get(f"/api/v1/bot-recipes/{recipe.id}-some-title")
    assert res.status_code == 200
    assert "og:title" in res.content.decode()
