from __future__ import annotations

import json

import pytest
from django.test.client import Client

from recipeyak.models import Team, User

pytestmark = pytest.mark.django_db


def test_ably_token_request(client: Client, user: User, team: Team) -> None:
    client.force_login(user)

    # the Ably client is shared, so make sure it works across multiple requests
    first = client.get("/api/v1/auth/ably/")
    second = client.get("/api/v1/auth/ably/")

    assert first.status_code == second.status_code == 200
    assert first.json()["clientId"] == str(user.id)
    assert json.loads(first.json()["capability"]) == {
        f"team:{team.id}:*": ["presence", "subscribe"]
    }
    assert first.json()["mac"] != second.json()["mac"]
