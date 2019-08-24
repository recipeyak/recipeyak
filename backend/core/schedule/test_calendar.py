import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from core.models import MyUser, Team

pytestmark = pytest.mark.django_db


def test_user_precense_view(
    client: APIClient, team: Team, user: MyUser, user2: MyUser
) -> None:
    """
    ensure that only authorized users can access the user precense view
    """
    url = reverse("calendar-presence", kwargs={"team_pk": team.id})
    assert url == f"/api/v1/calendar-presence/{team.id}"

    res = client.post(url)
    assert res.status_code == status.HTTP_403_FORBIDDEN, "no auth provided"

    assert not team.is_member(user2)
    client.force_authenticate(user2)
    res = client.post(url)
    assert res.status_code == status.HTTP_403_FORBIDDEN, "unauthorized user"

    assert team.is_member(user)
    client.force_authenticate(user)
    res = client.post(url)
    assert res.status_code == status.HTTP_200_OK, "authorized user"
