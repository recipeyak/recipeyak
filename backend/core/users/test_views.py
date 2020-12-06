from dataclasses import dataclass
from typing import Dict, List, Type, Union, Any

import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.response import Response
from rest_framework.test import APIClient
from user_sessions.models import Session

from core.models import MyUser


@pytest.mark.django_db
def test_detail(client, user, empty_team):
    url = reverse("rest_user_details")
    res = client.get(url)
    assert res.status_code == status.HTTP_403_FORBIDDEN, "authentication required"

    client.force_authenticate(user)
    res = client.get(url)
    keys = set(res.json().keys())
    expected = {
        "id",
        "email",
        "avatar_url",
        "has_usable_password",
        "dark_mode_enabled",
        "selected_team",
    }
    assert expected.issubset(keys), "sanity test to ensure we have what we expect"
    original_data = res.json()

    res = client.patch(url, {"avatar_url": "example.com"})
    assert res.json() == original_data, "user shouldn't be able to update avatar url"

    data = {
        "email": "testing123@example.com",
        "dark_mode_enabled": True,
        "selected_team": empty_team.id,
    }
    for key in data.keys():
        assert original_data[key] != data[key], "we want different fields to test with"
    res = client.patch(url, data)
    assert res.status_code == status.HTTP_200_OK
    for key in data.keys():
        assert res.json()[key] == data[key], "fields should be updated"


KindType = Union[Type[str], Type[int], Type[bool], Type[list], Type[dict]]


@dataclass
class Key:
    name: str
    kind: KindType


@dataclass
class Shape:
    url: str
    keys: List[Key]


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
def login_info() -> Dict[str, str]:
    return dict(email="john@doe.org", password="testing123")


@pytest.fixture
def logged_in_user(client: APIClient, login_info) -> None:
    MyUser.objects.create_user(**login_info)
    res = client.post(reverse("rest_login"), login_info)
    assert res.status_code == status.HTTP_200_OK


@pytest.mark.django_db
def test_session_list(client: APIClient, logged_in_user) -> None:
    res = client.get(reverse("sessions-list"))

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


@pytest.mark.django_db
def test_session_delete_all(
    client: APIClient, logged_in_user, login_info: Dict[str, Any]
) -> None:
    # login a second time with a different client to create multiple sessions
    APIClient().post(reverse("rest_login"), login_info)
    assert Session.objects.count() == 2
    res = client.delete(reverse("sessions-list"))
    assert res.status_code == status.HTTP_204_NO_CONTENT
    assert (
        Session.objects.count() == 1
    ), "we delete other sessions, not the session being used"


@pytest.mark.django_db
def test_session_delete_by_id(client: APIClient, logged_in_user) -> None:
    assert Session.objects.count() == 1
    pk = Session.objects.first().pk
    res = client.delete(reverse("sessions-detail", kwargs=dict(pk=pk)))
    assert res.status_code == status.HTTP_204_NO_CONTENT
    assert Session.objects.count() == 0
