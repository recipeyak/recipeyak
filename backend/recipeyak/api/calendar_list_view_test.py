from datetime import date

import pytest
from rest_framework import status
from rest_framework.test import APIClient

from recipeyak.models import Recipe, Team, User
from recipeyak.models.membership import Membership

pytestmark = pytest.mark.django_db


def test_fetching_team_calendar_v2(
    client: APIClient, user: User, team: Team, recipe: Recipe
) -> None:
    """
    Updated response type to include config options for the icalendar
    syncing.
    """
    url = url = f"/api/v1/t/{team.pk}/calendar/"
    client.force_authenticate(user)
    recipe.schedule(on=date(1976, 1, 2), team=team, user=user)

    res = client.get(url, {"start": date(1976, 1, 1), "end": date(1977, 1, 1), "v2": 1})
    assert res.status_code == status.HTTP_200_OK

    assert isinstance(res.json()["scheduledRecipes"], list)
    assert len(res.json()["scheduledRecipes"]) > 0
    assert recipe.id in {x["recipe"]["id"] for x in res.json()["scheduledRecipes"]}

    assert isinstance(res.json()["settings"], dict)
    assert isinstance(res.json()["settings"]["syncEnabled"], bool)
    assert isinstance(res.json()["settings"]["calendarLink"], str)


def test_fetching_team_cal_v2_content(
    client: APIClient, user: User, team: Team, recipe: Recipe
) -> None:
    """
    Ensure changing the rows updates the response.
    """
    url = url = f"/api/v1/t/{team.pk}/calendar/"
    client.force_authenticate(user)

    res = client.get(url, {"start": date(1976, 1, 1), "end": date(1977, 1, 1), "v2": 1})
    assert res.status_code == status.HTTP_200_OK

    membership = Membership.objects.filter(user=user).get(team=team)

    assert res.json()["settings"]["syncEnabled"] == membership.calendar_sync_enabled
    assert membership.calendar_sync_enabled is False
    res_cal_link = res.json()["settings"]["calendarLink"]
    assert (
        res_cal_link
        == f"http://testserver/t/{team.pk}/ical/{membership.calendar_secret_key}/schedule.ics"
    )

    membership.calendar_sync_enabled = True
    membership.calendar_secret_key = "foo"
    membership.save()

    res = client.get(url, {"start": date(1976, 1, 1), "end": date(1977, 1, 1), "v2": 1})

    assert res.status_code == status.HTTP_200_OK
    assert res.json()["settings"]["syncEnabled"] == membership.calendar_sync_enabled
    assert membership.calendar_sync_enabled is True
