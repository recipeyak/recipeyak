import pytest
from rest_framework.test import APIClient

from recipeyak.models import Team, User

pytestmark = pytest.mark.django_db


def test_cal_next_open(
    client: APIClient, user: User, team: Team, empty_team: Team
) -> None:
    """
    Check finding the next open day / weekend
    """
    client.force_authenticate(user)
    res = client.get(
        f"/api/v1/t/{team.pk}/calendar/next_open/",
        data={"day": "Wednesday", "now": "2022-04-15"},
    )
    assert res.status_code == 200
    assert isinstance(res.json()["date"], str)
