from datetime import date

import pytest
from django.test.client import Client

from recipeyak.models import Recipe, Team, User

pytestmark = pytest.mark.django_db


def test_cal_generate_link_view(
    client: Client, user: User, team: Team, recipe: Recipe
) -> None:
    """
    Get the current link and ensure it changes after regen.
    """
    client.force_login(user)
    res = client.get(
        "/api/v1/calendar/",
        {"start": date(1976, 1, 1), "end": date(1977, 1, 1), "v2": 1},
    )
    assert res.status_code == 200
    initial_link = res.json()["settings"]["calendarLink"]

    res = client.post(
        "/api/v1/calendar/generate_link/", content_type="application/json"
    )
    assert res.status_code == 200
    assert isinstance(res.json()["calendarLink"], str)
    assert res.json()["calendarLink"] != initial_link, "ensure we changed the link"
