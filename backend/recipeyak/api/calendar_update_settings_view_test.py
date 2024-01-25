import pytest
from django.test.client import Client

from recipeyak.models import Recipe, Team, User
from recipeyak.models.membership import Membership

pytestmark = pytest.mark.django_db


def test_cal_updating_settings_view(
    client: Client, user: User, team: Team, recipe: Recipe
) -> None:
    """
    Ensure we can update the `syncEnabled` setting for the UI to work.
    """
    url = "/api/v1/calendar/settings/"

    membership = Membership.objects.filter(user=user).get(team=team)
    assert membership.calendar_sync_enabled is False

    client.force_login(user)
    res = client.patch(url, {"syncEnabled": True}, content_type="application/json")
    assert res.status_code == 200
    assert res.json()["syncEnabled"] is True
    membership.refresh_from_db()
    assert membership.calendar_sync_enabled is True
