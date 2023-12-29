import pytest
from django.conf import settings
from rest_framework.test import APIClient
from user_sessions.models import Session

from recipeyak.models import User

pytestmark = pytest.mark.django_db


def test_signup(client: APIClient) -> None:
    """
    ensure a user can signup
    """
    url = "/api/v1/user/"
    res = client.get(url)
    assert res.status_code == 403
    assert (
        res.json().get("detail") == "Authentication credentials were not provided."
    ), "Required detail for client side logout on session expiration missing"

    email = "testing@gmail.com"

    password = "password123"

    data = {"email": email, "password1": password, "password2": password}

    res = client.post("/api/v1/auth/registration/", data)
    assert res.status_code == 201
    res = client.get(url)
    assert res.status_code == 200


def test_login(client: APIClient) -> None:
    """
    make sure we can login with a user
    """
    email = "john@doe.org"
    password = "testing123"
    user = User.objects.create(email=email)
    user.set_password(password)
    user.save()

    data = {"email": email, "password": password}

    assert Session.objects.count() == 0

    headers = {
        "HTTP_X_FORWARDED_FOR": "10.0.0.1",
        "HTTP_USER_AGENT": "j person's cool bot",
    }

    res = client.post("/api/v1/auth/login/", data, **headers)  # type: ignore[arg-type]
    assert res.status_code == 200

    assert Session.objects.count() == 1
    session = Session.objects.get()
    assert session.user_agent == headers["HTTP_USER_AGENT"]
    assert session.ip == headers["HTTP_X_FORWARDED_FOR"]

    assert (
        client.cookies[settings.SESSION_COOKIE_NAME]["samesite"]
        == settings.SESSION_COOKIE_SAMESITE
    )
    assert settings.SESSION_COOKIE_SAMESITE == "Lax"

    res = client.get("/api/v1/user/")
    assert res.status_code == 200


def test_logout(client: APIClient) -> None:
    """
    make sure a user can logout
    """
    email = "john@doe.org"
    password = "testing123"
    user = User.objects.create(email=email)
    user.set_password(password)
    user.save()

    data = {"email": email, "password": password}

    res = client.post("/api/v1/auth/login/", data)
    assert res.status_code == 200

    res = client.post("/api/v1/auth/logout/")
    assert res.status_code == 200

    res = client.get("/api/v1/user/")
    assert (
        res.status_code == 403
    ), "logged out user was able to access login required info"

    assert (
        res.json().get("detail") == "Authentication credentials were not provided."
    ), "error response message not provided"


def test_login_in_two_places_and_logout_from_one(
    client: APIClient, client_b: APIClient
) -> None:
    """
    ensure when logged into one place, logging out doesn't result in logging out of both places.

    This test ensure that the session auth works
    """
    email = "john@doe.org"
    password = "testing123"
    user = User.objects.create(email=email)
    user.set_password(password)
    user.save()

    data = {"email": email, "password": password}

    # 1. log in once
    res = client.post("/api/v1/auth/login/", data)
    assert res.status_code == 200

    # 2. log in a second time
    res = client_b.post("/api/v1/auth/login/", data)
    assert res.status_code == 200

    # 3. logout first login session
    res = client.post("/api/v1/auth/logout/")
    assert res.status_code == 200

    # 4. ensure first login key doesn't work
    res = client.get("/api/v1/user/")
    assert res.status_code == 403

    # 4. ensure second login key still works
    res = client_b.get("/api/v1/user/")
    assert res.status_code == 200


def test_signup_case_insensitive(client: APIClient) -> None:
    """
    Emails should be treated as case insensitive. A user should not be able to
    signup with the same email and different case.
    """
    url = "/api/v1/user/"
    res = client.get(url)
    assert res.status_code == 403

    email = "testing@gmail.com"

    password = "password123"

    data = {"email": email, "password1": password, "password2": password}

    res = client.post("/api/v1/auth/registration/", data)
    assert res.status_code == 201

    res = client.get(url)
    assert res.status_code == 200

    client.force_authenticate(user=None)
    email2 = "TESTing@gmail.com"
    assert email2.lower() == email
    res = client.post("/api/v1/auth/registration/", data)
    assert res.status_code in (
        401,
        400,
    )
