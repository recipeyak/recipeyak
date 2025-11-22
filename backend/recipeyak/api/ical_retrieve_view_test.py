from datetime import date
from urllib.parse import urlparse

import pytest
from django.test.client import Client
from syrupy.assertion import SnapshotAssertion

from recipeyak.models import Recipe, ScheduledRecipe, Team, User, get_random_ical_id
from recipeyak.models.membership import Membership

pytestmark = pytest.mark.django_db


def test_ical_view_with_invalid_id(client: Client, user: User, team: Team) -> None:
    """
    We should return a 404 when a user doesn't pass the correct id for the schedule.
    """
    fake_team_id = get_random_ical_id()
    res = client.get(f"/t/{team.id}/ical/{fake_team_id}/schedule.ics")
    assert res.status_code == 404


def omit_entry_ids(content: str) -> str:
    output = ""
    for i, line in enumerate(content.split("\r\n")):
        if i > 0:
            output += "\r\n"
        if line.startswith("UID"):
            output += "UID:<id-removed>"
        elif line.startswith("CREATED"):
            output += "CREATED:<timestamp-removed>"
        elif line.startswith("DTSTAMP"):
            output += "DTSTAMP:<timestamp-removed>"
        elif line.startswith("LAST-MODIFIED"):
            output += "LAST-MODIFIED:<timestamp-removed>"
        elif line.startswith("URL"):
            output += "URL:https://recipeyak.com/recipes/<id-removed>"
        else:
            output += line
    return output


def test_ical_ids_consistent(
    client: Client, user: User, recipe: Recipe, team: Team
) -> None:
    """
    Regression test to ensure the ids for the items aren't changing on each
    request.
    """
    ScheduledRecipe.objects.create(recipe=recipe, team=team, on=date(1976, 7, 6))
    ScheduledRecipe.objects.create(recipe=recipe, team=team, on=date(1976, 7, 7))
    ScheduledRecipe.objects.create(recipe=recipe, team=team, on=date(1976, 7, 10))
    membership = Membership.objects.filter(user=user).get(team=team)
    membership.calendar_sync_enabled = True
    membership.save()
    ical_id = membership.calendar_secret_key
    url = f"/t/{team.id}/ical/{ical_id}/schedule.ics"
    res = client.get(url)
    assert res.status_code == 200

    res_second = client.get(url)
    assert res_second.status_code == 200

    assert (
        res.content == res_second.content
    ), "Ensure we don't have ids being regenerated and changing on each request"


def test_ical_view_with_correct_id(
    client: Client, user: User, recipe: Recipe, team: Team, snapshot: SnapshotAssertion
) -> None:
    """
    When the client passes in the correct id we should return the ical data.
    We omit the ids to make the snapshot style test work with the random
    uuids used by the calendar entries.
    """

    ScheduledRecipe.objects.create(
        recipe=recipe,
        team=team,
        on=date(1976, 7, 6),
        calendar=user.pinned_calendar,
    )
    ScheduledRecipe.objects.create(
        recipe=recipe,
        team=team,
        on=date(1976, 7, 7),
        calendar=user.pinned_calendar,
    )
    ScheduledRecipe.objects.create(
        recipe=recipe,
        team=team,
        on=date(1976, 7, 10),
        calendar=user.pinned_calendar,
    )

    membership = Membership.objects.filter(user=user).get(team=team)
    membership.calendar_sync_enabled = True
    membership.save()
    ical_id = membership.calendar_secret_key
    url = f"/t/{team.id}/ical/{ical_id}/schedule.ics"
    res = client.get(url)
    assert res.status_code == 200
    assert res["Content-Type"] == "text/calendar"

    assert omit_entry_ids(res.content.decode()) == snapshot()


def test_filter_to_current_team(
    client: Client, user: User, recipe: Recipe, team: Team
) -> None:
    ScheduledRecipe.objects.create(
        recipe=recipe,
        team=team,
        on=date(1976, 7, 6),
        calendar=user.pinned_calendar,
    )
    team_2 = Team.objects.create(name="Recipe Yak Team")
    ScheduledRecipe.objects.create(
        recipe=recipe,
        team=team_2,
        on=date(1976, 7, 10),
        calendar=user.pinned_calendar,
    )
    membership = Membership.objects.filter(user=user).get(team=team)
    membership.calendar_sync_enabled = True
    membership.save()
    ical_id = membership.calendar_secret_key
    url = f"/t/{team.id}/ical/{ical_id}/schedule.ics"
    res = client.get(url, HTTP_ACCEPT="text/calendar")
    assert res.status_code == 200
    unique_ids = {x for x in res.content.split(b"\r\n") if x.startswith(b"UID")}
    assert len(unique_ids) == 1, "shouldn't see the other team's stuff"


def test_get_ical_view_works_with_accept_encoding(
    client: Client, user: User, recipe: Recipe, team: Team
) -> None:
    """
    Clicking an .ics link on iOS will trigger iOS to make a GET request to
    the URL with accept header set to `text/calendar`.

    When the view is setup using DRF this fails and returns a 406, which
    prevents the Calendar app from using the "subscribed" calendar.
    """
    membership = Membership.objects.filter(user=user).get(team=team)
    membership.calendar_sync_enabled = True
    membership.save()
    ical_id = membership.calendar_secret_key
    url = f"/t/{team.id}/ical/{ical_id}/schedule.ics"
    res = client.get(url, HTTP_ACCEPT="text/calendar")
    assert res.status_code == 200


def test_head_ical(client: Client, user: User, recipe: Recipe, team: Team) -> None:
    """
    HEAD should work
    """
    membership = Membership.objects.filter(user=user).get(team=team)
    membership.calendar_sync_enabled = True
    membership.save()
    ical_id = membership.calendar_secret_key
    url = f"/t/{team.id}/ical/{ical_id}/schedule.ics"
    res = client.head(url, HTTP_ACCEPT="text/calendar")
    assert res.status_code == 200


def test_get_ical_view_with_user_specific_id(
    client: Client, user: User, recipe: Recipe, team: Team
) -> None:
    """
    Ensure the user specific secret key works.
    """
    membership = Membership.objects.filter(user=user).get(team=team)
    membership.calendar_sync_enabled = True
    membership.save()
    url = f"/t/{team.id}/ical/{membership.calendar_secret_key}/schedule.ics"
    res = client.get(url, HTTP_ACCEPT="text/calendar")
    assert res.status_code == 200


def test_get_ical_view_with_schedule_endpoint(
    client: Client, user: User, recipe: Recipe, team: Team
) -> None:
    """
    Ensure the url from the schedule endpoint is valid.
    """
    client.force_login(user)

    res = client.get("/api/v1/calendar/settings/")
    assert res.status_code == 200
    calendar_link = res.json()["calendarLink"]

    client.logout()
    relative_url = urlparse(calendar_link).path

    membership = user.membership_set.get(team=team)
    membership.calendar_sync_enabled = True
    membership.save()

    res = client.get(relative_url, HTTP_ACCEPT="text/calendar")
    assert (
        res.status_code == 200
    ), "API returned a valid URL for retrieving calendar info."


def test_get_ical_view_404_when_disabled(
    client: Client, user: User, recipe: Recipe, team: Team
) -> None:
    """
    Url should be disabled when calendar_sync_enabled is false.
    """
    membership = Membership.objects.filter(user=user).get(team=team)
    membership.calendar_sync_enabled = True
    membership.save()
    url = f"/t/{team.id}/ical/{membership.calendar_secret_key}/schedule.ics"
    res = client.get(url, HTTP_ACCEPT="text/calendar")
    assert res.status_code == 200

    membership.calendar_sync_enabled = False
    membership.save()
    res = client.get(url, HTTP_ACCEPT="text/calendar")
    assert res.status_code == 404
