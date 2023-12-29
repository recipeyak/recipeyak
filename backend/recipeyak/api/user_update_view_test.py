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

    res = client.patch(
        "/api/v1/user/", {"avatar_url": "example.com"}, content_type="application/json"
    )
    assert res.json() == original_data, "user shouldn't be able to update avatar url"

    data = {
        "email": "testing123@example.com",
        "name": "John",
    }
    for key in data:
        assert original_data[key] != data[key], "we want different fields to test with"
    res = client.patch("/api/v1/user/", data, content_type="application/json")
    assert res.status_code == 200
    for key in data:
        assert res.json()[key] == data[key], "fields should be updated"


def test_detail_theme(client: Client, user: User) -> None:
    user.theme_day = "light"
    user.save()
    client.force_login(user)

    res = client.get("/api/v1/user/")
    assert res.json()["theme_day"] == "light"

    res = client.patch(
        "/api/v1/user/", {"theme_day": "solarized"}, content_type="application/json"
    )
    assert res.json()["theme_day"] == "solarized"
