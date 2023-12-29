from __future__ import annotations

import pytest
from django.test.client import Client

from recipeyak.models import User

pytestmark = pytest.mark.django_db


def test_detail(client: Client, user: User) -> None:
    res = client.get("/api/v1/user/")
    assert res.status_code == 403, "authentication required"

    client.force_login(user)
    res = client.get("/api/v1/user/")
    keys = set(res.json().keys())
    expected = {
        "id",
        "email",
        "name",
        "avatar_url",
        "theme_day",
        "theme_night",
        "theme_mode",
    }
    assert expected.issubset(keys), "sanity test to ensure we have what we expect"
    original_data = res.json()

    assert original_data["name"] == original_data["email"]
