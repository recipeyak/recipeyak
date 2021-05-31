import pytest
from allauth.socialaccount.models import EmailAddress
from django.conf import settings
from django.urls import reverse
from rest_framework import status
from user_sessions.models import Session

from core.models import User
from core.users.serializers import UserSerializer

pytestmark = pytest.mark.django_db


def test_signup(client):
    """
    ensure a user can signup
    """
    url = reverse("rest_user_details")
    res = client.get(url)
    assert res.status_code == status.HTTP_403_FORBIDDEN
    assert (
        res.json().get("detail") == "Authentication credentials were not provided."
    ), "Required detail for client side logout on session expiration missing"

    email = "testing@gmail.com"

    password = "password123"

    data = {"email": email, "password1": password, "password2": password}

    res = client.post(reverse("rest_register"), data)
    assert res.status_code == status.HTTP_201_CREATED

    user = User.objects.first()
    assert (
        res.json().get("user") == UserSerializer(user).data
    ), "response didn't return user data"

    res = client.get(url)
    assert res.status_code == status.HTTP_200_OK

    assert EmailAddress.objects.filter(
        email=email
    ).exists(), "signup should create email object"


def test_login(client):
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

    res = client.post(reverse("rest_login"), data, **headers)
    assert res.status_code == status.HTTP_200_OK

    assert Session.objects.count() == 1
    session = Session.objects.get()
    assert session.user_agent == headers["HTTP_USER_AGENT"]
    assert session.ip == headers["HTTP_X_FORWARDED_FOR"]

    assert (
        client.cookies[settings.SESSION_COOKIE_NAME]["samesite"]
        == settings.SESSION_COOKIE_SAMESITE
    )
    assert settings.SESSION_COOKIE_SAMESITE == "Lax"

    assert (
        res.json().get("user") == UserSerializer(user).data
    ), "response didn't return user data"

    res = client.get(reverse("rest_user_details"))
    assert res.status_code == status.HTTP_200_OK


def test_logout(client):
    """
    make sure a user can logout
    """
    email = "john@doe.org"
    password = "testing123"
    user = User.objects.create(email=email)
    user.set_password(password)
    user.save()

    data = {"email": email, "password": password}

    res = client.post(reverse("rest_login"), data)
    assert res.status_code == status.HTTP_200_OK

    res = client.post(reverse("rest_logout"))
    assert res.status_code == status.HTTP_200_OK

    res = client.get(reverse("rest_user_details"))
    assert (
        res.status_code == status.HTTP_403_FORBIDDEN
    ), "logged out user was able to access login required info"

    assert (
        res.json().get("detail") == "Authentication credentials were not provided."
    ), "error response message not provided"


def test_login_in_two_places_and_logout_from_one(client, client_b):
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
    res = client.post(reverse("rest_login"), data)
    assert res.status_code == status.HTTP_200_OK

    assert res.json().get("user") == UserSerializer(user).data

    # 2. log in a second time
    res = client_b.post(reverse("rest_login"), data)
    assert res.status_code == status.HTTP_200_OK

    assert res.json().get("user") == UserSerializer(user).data

    # 3. logout first login session
    res = client.post(reverse("rest_logout"))
    assert res.status_code == status.HTTP_200_OK

    # 4. ensure first login key doesn't work
    res = client.get(reverse("rest_user_details"))
    assert res.status_code == status.HTTP_403_FORBIDDEN

    # 4. ensure second login key still works
    res = client_b.get(reverse("rest_user_details"))
    assert res.status_code == status.HTTP_200_OK


def test_signup_case_insensitive(client):
    """
    Emails should be treated as case insensitive. A user should not be able to
    signup with the same email and different case.
    """
    url = reverse("rest_user_details")
    res = client.get(url)
    assert res.status_code == status.HTTP_403_FORBIDDEN

    email = "testing@gmail.com"

    password = "password123"

    data = {"email": email, "password1": password, "password2": password}

    res = client.post(reverse("rest_register"), data)
    assert res.status_code == status.HTTP_201_CREATED

    user = User.objects.first()
    assert (
        res.json().get("user") == UserSerializer(user).data
    ), "response didn't return user data"

    res = client.get(url)
    assert res.status_code == status.HTTP_200_OK

    client.force_authenticate(user=None)
    email2 = "TESTing@gmail.com"
    assert email2.lower() == email
    res = client.post(reverse("rest_register"), data)
    assert res.status_code in (
        status.HTTP_401_UNAUTHORIZED,
        status.HTTP_400_BAD_REQUEST,
    )


def test_signup_user_has_email(client, user):
    """
    With social providers, a user can signup with an email account and connect
    a social account that has a different email. We want to prevent an email signup with that same email address.
    """
    assert EmailAddress.objects.filter(email=user.email).exists()
    email2 = "john@example.com"

    new_email_object = EmailAddress.objects.create(email=email2, user=user)
    user.emailaddress_set.add(new_email_object)
    user.save()

    assert EmailAddress.objects.filter(email=email2).exists()

    password = "password123"
    data = {"email": email2, "password1": password, "password2": password}

    res = client.post(reverse("rest_register"), data)
    assert res.status_code == status.HTTP_400_BAD_REQUEST
