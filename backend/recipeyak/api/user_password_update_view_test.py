import pytest
from django.test.client import Client

from recipeyak.models import User

pytestmark = pytest.mark.django_db


def test_password_change_logs_out_other_sessions(
    client: Client, client_b: Client
) -> None:
    user = User.objects.create_user(email="john@doe.org", password="testing123")
    data = {"email": "john@doe.org", "password": "testing123"}
    for c in (client, client_b):
        res = c.post("/api/v1/auth/login/", data, content_type="application/json")
        assert res.status_code == 200

    res = client.post(
        "/api/v1/auth/password/change/",
        {
            "old_password": "testing123",
            "new_password1": "a new password 456",
            "new_password2": "a new password 456",
        },
        content_type="application/json",
    )
    assert res.status_code == 200

    assert user.session_set.count() == 1
    assert client.get("/api/v1/user/").status_code == 200
    assert client_b.get("/api/v1/user/").status_code == 403
