from datetime import date

import pytest
from rest_framework.test import APIClient

from recipeyak.models import Recipe, Team, User

pytestmark = pytest.mark.django_db


def test_cal_generate_link_view(
    client: APIClient, user: User, team: Team, recipe: Recipe
) -> None:
    """
    Get the current link and ensure it changes after regen.
    """
    client.force_authenticate(user)
    res = client.get(
        f"/api/v1/t/{team.pk}/calendar/",
        {"start": date(1976, 1, 1), "end": date(1977, 1, 1), "v2": 1},
    )
    assert res.status_code == 200
    initial_link = res.json()["settings"]["calendarLink"]

    res = client.post(f"/api/v1/t/{team.pk}/calendar/generate_link/")
    assert res.status_code == 200
    assert isinstance(res.json()["calendarLink"], str)
    assert res.json()["calendarLink"] != initial_link, "ensure we changed the link"
