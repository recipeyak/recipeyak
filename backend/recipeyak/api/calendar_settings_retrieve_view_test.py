from datetime import date

import pytest
from django.test.client import Client

from recipeyak.models import Recipe, Team, User
from recipeyak.models.membership import Membership

pytestmark = pytest.mark.django_db


def test_fetching_team_calendar_v2(
    client: Client, user: User, team: Team, recipe: Recipe
) -> None:
    """
    Updated response type to include config options for the icalendar
    syncing.
    """
    url = "/api/v1/calendar/"
    client.force_login(user)
    recipe.schedule(on=date(1976, 1, 2), team=team, user=user)

    res = client.get(url, {"start": date(1976, 1, 1), "end": date(1977, 1, 1), "v2": 1})
    assert res.status_code == 200

    assert isinstance(res.json()["scheduledRecipes"], list)
    assert len(res.json()["scheduledRecipes"]) > 0
    assert recipe.id in {x["recipe"]["id"] for x in res.json()["scheduledRecipes"]}

    assert isinstance(res.json()["settings"], dict)
    assert isinstance(res.json()["settings"]["syncEnabled"], bool)
    assert isinstance(res.json()["settings"]["calendarLink"], str)


def test_fetching_team_cal_v2_content(
    client: Client, user: User, team: Team, recipe: Recipe
) -> None:
    """
    Ensure changing the rows updates the response.
    """
    url = "/api/v1/calendar/"
    client.force_login(user)

    res = client.get(url, {"start": date(1976, 1, 1), "end": date(1977, 1, 1), "v2": 1})
    assert res.status_code == 200

    membership = Membership.objects.filter(user=user).get(team=team)

    assert res.json()["settings"]["syncEnabled"] == membership.calendar_sync_enabled
    assert membership.calendar_sync_enabled is False
    res_cal_link = res.json()["settings"]["calendarLink"]
    assert (
        res_cal_link
        == f"webcal://testserver/t/{team.pk}/ical/{membership.calendar_secret_key}/schedule.ics"
    )

    membership.calendar_sync_enabled = True
    membership.calendar_secret_key = "foo"
    membership.save()

    res = client.get(url, {"start": date(1976, 1, 1), "end": date(1977, 1, 1), "v2": 1})

    assert res.status_code == 200
    assert res.json()["settings"]["syncEnabled"] == membership.calendar_sync_enabled
    assert membership.calendar_sync_enabled is True


def test_fetching_settings(
    client: Client, user: User, team: Team, recipe: Recipe
) -> None:
    """
    Ensure changing the rows updates the response.
    """
    url = "/api/v1/calendar/settings"
    client.force_login(user)

    res = client.get(url)
    assert res.status_code == 200

    membership = Membership.objects.filter(user=user).get(team=team)

    assert res.json()["syncEnabled"] == membership.calendar_sync_enabled
    assert membership.calendar_sync_enabled is False
    res_cal_link = res.json()["calendarLink"]
    assert (
        res_cal_link
        == f"webcal://testserver/t/{team.pk}/ical/{membership.calendar_secret_key}/schedule.ics"
    )

    membership.calendar_sync_enabled = True
    membership.calendar_secret_key = "foo"
    membership.save()

    res = client.get(url)

    assert res.status_code == 200
    assert res.json()["syncEnabled"] == membership.calendar_sync_enabled
    assert membership.calendar_sync_enabled is True
