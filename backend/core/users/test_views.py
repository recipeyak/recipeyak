import pytest
from django.urls import reverse
from rest_framework import status


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
