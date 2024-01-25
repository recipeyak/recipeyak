import pytest
from django.test.client import Client

from recipeyak.models import Team, User

pytestmark = pytest.mark.django_db


def test_cal_next_open(
    client: Client, user: User, team: Team, empty_team: Team
) -> None:
    """
    Check finding the next open day / weekend
    """
    client.force_login(user)
    res = client.get(
        "/api/v1/calendar/next_open/",
        data={"day": "Wednesday", "now": "2022-04-15"},
    )
    assert res.status_code == 200
    assert isinstance(res.json()["date"], str)
