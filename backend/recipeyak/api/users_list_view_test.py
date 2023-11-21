from __future__ import annotations

from dataclasses import dataclass
from typing import Any, cast

import pytest
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.response import Response
from rest_framework.test import APIClient
from user_sessions.models import Session

from recipeyak.models import Team, User

pytestmark = pytest.mark.django_db


def test_user_delete(client: APIClient, user: User, team: Team) -> None:
    """
    User should only be able to delete their account if they are not a member
    of any team (excluding invites).
    """

    client.force_authenticate(user)
    url = "/api/v1/user/"
    assert team.is_member(user)
    assert user.has_team()
    res = client.delete(url)
    assert res.status_code == status.HTTP_204_NO_CONTENT

    assert not cast(Any, get_user_model()).objects.filter(id=user.id).exists()


def test_detail(client: APIClient, user: User) -> None:
    res = client.get("/api/v1/user/")
    assert res.status_code == status.HTTP_403_FORBIDDEN, "authentication required"

    client.force_authenticate(user)
    res = client.get("/api/v1/user/")
    keys = set(res.json().keys())
    expected = {
        "id",
        "email",
        "name",
        "avatar_url",
        "theme",
    }
    assert expected.issubset(keys), "sanity test to ensure we have what we expect"
    original_data = res.json()

    assert original_data["name"] == original_data["email"]

    res = client.patch("/api/v1/user/", {"avatar_url": "example.com"})
    assert res.json() == original_data, "user shouldn't be able to update avatar url"

    data = {
        "email": "testing123@example.com",
        "name": "John",
    }
    for key in data:
        assert original_data[key] != data[key], "we want different fields to test with"
    res = client.patch("/api/v1/user/", data)
    assert res.status_code == status.HTTP_200_OK
    for key in data:
        assert res.json()[key] == data[key], "fields should be updated"


@dataclass
class Key:
    name: str
    kind: type[str] | type[int] | type[bool] | type[list[Any]] | type[dict[Any, Any]]


@dataclass
class Shape:
    url: str
    keys: list[Key]


def matches_shape(res: Response, shape: Shape) -> bool:
    assert res.request.get("PATH_INFO") == shape.url

    obj = res.json()[0] if isinstance(res.json(), list) else res.json()

    key_set = {k.name: k.kind for k in shape.keys}

    for k, v in key_set.items():
        if k not in obj:
            return False

        if obj[k] is None and v is not None:
            return False
        elif not isinstance(obj[k], v):
            return False
    return True


@pytest.fixture
def login_info() -> dict[str, str]:
    return {"email": "john@doe.org", "password": "testing123"}


@pytest.fixture
def logged_in_user(client: APIClient, login_info: dict[str, Any]) -> None:
    User.objects.create_user(**login_info)
    res = client.post("/api/v1/auth/login/", login_info)
    assert res.status_code == status.HTTP_200_OK


def test_session_list(client: APIClient, logged_in_user: User) -> None:
    res = client.get("/api/v1/sessions/")

    assert isinstance(res.json(), list)

    assert matches_shape(
        res,
        Shape(
            url="/api/v1/sessions/",
            keys=[
                Key("id", str),
                Key("device", dict),
                Key("last_activity", str),
                Key("ip", str),
            ],
        ),
    )


def test_session_delete_all(
    client: APIClient, logged_in_user: User, login_info: dict[str, Any]
) -> None:
    # login a second time with a different client to create multiple sessions
    APIClient().post("/api/v1/auth/login/", login_info)
    assert Session.objects.count() == 2
    res = client.delete("/api/v1/sessions/")
    assert res.status_code == status.HTTP_204_NO_CONTENT
    assert (
        Session.objects.count() == 1
    ), "we delete other sessions, not the session being used"


def test_session_delete_by_id(client: APIClient, logged_in_user: User) -> None:
    assert Session.objects.count() == 1
    session = Session.objects.first()
    assert session is not None
    res = client.delete(f"/api/v1/sessions/{session.pk}/")
    assert res.status_code == status.HTTP_204_NO_CONTENT
    assert Session.objects.count() == 0
