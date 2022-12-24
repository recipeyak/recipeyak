from datetime import date

import pytest
from rest_framework import status
from rest_framework.test import APIClient

from recipeyak.models import Recipe, ScheduledRecipe, Team, User
from recipeyak.models.membership import Membership

pytestmark = pytest.mark.django_db


def test_adding_to_team_calendar(
    client: APIClient, user: User, team: Team, recipe: Recipe
) -> None:
    url = f"/api/v1/t/{team.pk}/calendar/"
    data = {"recipe": recipe.id, "on": date(1976, 7, 6)}
    assert team.is_member(user)
    client.force_authenticate(user)
    res = client.post(url, data)
    assert res.status_code == status.HTTP_201_CREATED
    scheduled = ScheduledRecipe.objects.get(id=res.json().get("id"))
    assert scheduled.team is not None and scheduled.team.pk == team.pk


def test_removing_from_team_calendar(
    client: APIClient, user: User, team: Team, recipe: Recipe
) -> None:
    scheduled = recipe.schedule(on=date(1976, 1, 2), team=team, user=user)
    url = f"/api/v1/t/{team.pk}/calendar/{scheduled.id}/"
    client.force_authenticate(user)
    res = client.delete(url)
    assert res.status_code == status.HTTP_204_NO_CONTENT
    assert not ScheduledRecipe.objects.filter(id=scheduled.id).exists()


def test_updating_team_schedule_recipe(
    client: APIClient, user: User, team: Team, recipe: Recipe
) -> None:
    scheduled = recipe.schedule(on=date(1976, 1, 2), team=team, user=user)
    url = f"/api/v1/t/{team.pk}/calendar/{scheduled.id}/"
    data = {"on": date(1976, 1, 3)}
    client.force_authenticate(user)
    res = client.patch(url, data)
    assert res.status_code == status.HTTP_200_OK
    assert ScheduledRecipe.objects.get(id=scheduled.id).on == date(1976, 1, 3)


def test_fetching_team_calendar(
    client: APIClient, user: User, team: Team, recipe: Recipe
) -> None:
    url = f"/api/v1/t/{team.pk}/calendar/"

    client.force_authenticate(user)
    res = client.get(url)
    assert (
        res.status_code == status.HTTP_400_BAD_REQUEST
    ), "not providing start and end should result in a bad request"

    recipe.schedule(on=date(1976, 1, 2), team=team, user=user)

    res = client.get(url, {"start": date(1976, 1, 1), "end": date(1977, 1, 1)})
    assert res.status_code == status.HTTP_200_OK
    assert recipe.id in {x["recipe"]["id"] for x in res.json()}


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
    assert res.status_code == status.HTTP_200_OK
    initial_link = res.json()["settings"]["calendarLink"]

    res = client.post(f"/api/v1/t/{team.pk}/calendar/generate_link/")
    assert res.status_code == status.HTTP_200_OK
    assert isinstance(res.json()["calendarLink"], str)
    assert res.json()["calendarLink"] != initial_link, "ensure we changed the link"


def test_cal_next_open(
    client: APIClient, user: User, team: Team, empty_team: Team
) -> None:
    """
    Check finding the next open day / weekend
    """
    client.force_authenticate(user)

    res = client.get(
        f"/api/v1/t/{empty_team.pk}/calendar/next_open/",
        data={"day": "Wednesday", "now": "2022-04-15"},
    )
    assert (
        res.status_code == status.HTTP_403_FORBIDDEN
    ), "we shouldn't be able to access other teams"

    res = client.get(
        f"/api/v1/t/{team.pk}/calendar/next_open/",
        data={"day": "Wednesday", "now": "2022-04-15"},
    )
    assert res.status_code == status.HTTP_200_OK
    assert isinstance(res.json()["date"], str)
