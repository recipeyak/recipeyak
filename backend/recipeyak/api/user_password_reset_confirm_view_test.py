import pytest
from django.contrib.auth.tokens import default_token_generator
from django.test.client import Client
from django.utils.http import urlsafe_base64_encode

from recipeyak.models import User

pytestmark = pytest.mark.django_db


def test_password_reset_logs_out_existing_sessions(
    client: Client, client_b: Client
) -> None:
    user = User.objects.create_user(email="john@doe.org", password="testing123")
    res = client.post(
        "/api/v1/auth/login/",
        {"email": "john@doe.org", "password": "testing123"},
        content_type="application/json",
    )
    assert res.status_code == 200
    # the token covers last_login, which logging in just changed
    user.refresh_from_db()

    res = client_b.post(
        "/api/v1/auth/password/reset/confirm/",
        {
            "uid": urlsafe_base64_encode(str(user.pk).encode()),
            "token": default_token_generator.make_token(user),
            "new_password1": "a new password 456",
            "new_password2": "a new password 456",
        },
        content_type="application/json",
    )
    assert res.status_code == 200

    assert user.session_set.count() == 1
    assert client.get("/api/v1/user/").status_code == 403
    assert client_b.get("/api/v1/user/").status_code == 200
