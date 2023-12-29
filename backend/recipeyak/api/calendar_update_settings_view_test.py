import pytest
from rest_framework import status
from rest_framework.test import APIClient

from recipeyak.models import Recipe, Team, User
from recipeyak.models.membership import Membership

pytestmark = pytest.mark.django_db


def test_cal_updating_settings_view(
    client: APIClient, user: User, team: Team, recipe: Recipe
) -> None:
    """
    Ensure we can update the `syncEnabled` setting for the UI to work.
    """
    url = f"/api/v1/t/{team.pk}/calendar/settings/"

    membership = Membership.objects.filter(user=user).get(team=team)
    assert membership.calendar_sync_enabled is False

    client.force_authenticate(user)
    res = client.patch(url, {"syncEnabled": True})
    assert res.status_code == status.HTTP_200_OK
    assert res.json()["syncEnabled"] is True
    membership.refresh_from_db()
    assert membership.calendar_sync_enabled is True
