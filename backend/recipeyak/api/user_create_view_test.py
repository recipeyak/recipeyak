from unittest.mock import patch

import pytest
from django.test.client import Client

from recipeyak.models.user import User

pytestmark = pytest.mark.django_db


def test_signup(client: Client) -> None:
    """
    ensure a user can signup
    """
    url = "/api/v1/user/"
    res = client.get(url)
    assert res.status_code == 403
    assert (
        res.json()["error"]["message"]
        == "Authentication credentials were not provided."
    ), "Required detail for client side logout on session expiration missing"

    email = "testing@gmail.com"

    password = "password123"

    data = {
        "email": email,
        "password1": password,
        "password2": password,
        "turnstile_token": "token",
    }

    res = client.post(
        "/api/v1/auth/registration/", data, content_type="application/json"
    )
    assert res.status_code == 200
    res = client.get(url)
    assert res.status_code == 200


def test_signup_case_insensitive(client: Client) -> None:
    """
    Emails should be treated as case insensitive. A user should not be able to
    signup with the same email and different case.
    """
    url = "/api/v1/user/"
    res = client.get(url)
    assert res.status_code == 403

    email = "testing@gmail.com"

    password = "password123"

    data = {
        "email": email,
        "password1": password,
        "password2": password,
        "turnstile_token": "token",
    }

    res = client.post(
        "/api/v1/auth/registration/", data, content_type="application/json"
    )
    assert res.status_code == 200

    res = client.get(url)
    assert res.status_code == 200

    client.logout()
    email2 = "TESTing@gmail.com"
    assert email2.lower() == email
    res = client.post(
        "/api/v1/auth/registration/", data, content_type="application/json"
    )
    assert res.status_code in (
        401,
        400,
    )


def test_signup_rejects_failed_captcha(client: Client) -> None:
    data = {
        "email": "testing@gmail.com",
        "password1": "password123",
        "password2": "password123",
        "turnstile_token": "bad-token",
    }
    with patch("recipeyak.api.user_create_view.verify_token", return_value=False):
        res = client.post(
            "/api/v1/auth/registration/", data, content_type="application/json"
        )
    assert res.status_code == 400
    assert not User.objects.filter(email="testing@gmail.com").exists()
