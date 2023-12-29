from datetime import date, datetime
from email.utils import parsedate_to_datetime
from urllib.parse import urlparse

import pytest
from django.test.client import Client

from recipeyak.api.ical_retrieve_view import to_ical_time
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
    client: Client, user: User, recipe: Recipe, team: Team
) -> None:
    """
    When the client passes in the correct id we should return the ical data.
    We omit the ids to make the snapshot style test work with the random
    uuids used by the calendar entries.
    """

    scheduled_a = ScheduledRecipe.objects.create(
        recipe=recipe,
        team=team,
        on=date(1976, 7, 6),
    )
    scheduled_b = ScheduledRecipe.objects.create(
        recipe=recipe,
        team=team,
        on=date(1976, 7, 7),
    )
    scheduled_c = ScheduledRecipe.objects.create(
        recipe=recipe,
        team=team,
        on=date(1976, 7, 10),
    )

    membership = Membership.objects.filter(user=user).get(team=team)
    membership.calendar_sync_enabled = True
    membership.save()
    ical_id = membership.calendar_secret_key
    url = f"/t/{team.id}/ical/{ical_id}/schedule.ics"
    res = client.get(url)
    assert res.status_code == 200
    assert res["Content-Type"] == "text/calendar"
    assert isinstance(parsedate_to_datetime(res["Last-Modified"]), datetime)

    assert omit_entry_ids(res.content.decode()) == (
        "BEGIN:VCALENDAR\r\n"
        "VERSION:2.0\r\n"
        "PRODID:-//Recipe Yak//Schedule//EN\r\n"
        "CALSCALE:GREGORIAN\r\n"
        "X-WR-CALDESC:Recipe Yak Schedule for Team Recipe Yak Team\r\n"
        "X-WR-CALNAME:Scheduled Recipes\r\n"
        "BEGIN:VEVENT\r\n"
        "SUMMARY:Recipe name\r\n"
        "DTSTART;VALUE=DATE:19760706\r\n"
        "DTEND;VALUE=DATE:19760707\r\n"
        f"DTSTAMP:{to_ical_time(scheduled_a.created)}\r\n"
        "UID:<id-removed>\r\n"
        f"CREATED:{to_ical_time(scheduled_a.created)}\r\n"
        "DESCRIPTION:Takes about 1 hour\r\n"
        f"LAST-MODIFIED:{to_ical_time(scheduled_a.created)}\r\n"
        "TRANSP:TRANSPARENT\r\n"
        f"URL:https://recipeyak.com/recipes/{scheduled_a.recipe_id}-recipe-name\r\n"
        "END:VEVENT\r\n"
        "BEGIN:VEVENT\r\n"
        "SUMMARY:Recipe name\r\n"
        "DTSTART;VALUE=DATE:19760707\r\n"
        "DTEND;VALUE=DATE:19760708\r\n"
        f"DTSTAMP:{to_ical_time(scheduled_b.created)}\r\n"
        "UID:<id-removed>\r\n"
        f"CREATED:{to_ical_time(scheduled_b.created)}\r\n"
        "DESCRIPTION:Takes about 1 hour\r\n"
        f"LAST-MODIFIED:{to_ical_time(scheduled_b.created)}\r\n"
        "TRANSP:TRANSPARENT\r\n"
        f"URL:https://recipeyak.com/recipes/{scheduled_b.recipe_id}-recipe-name\r\n"
        "END:VEVENT\r\n"
        "BEGIN:VEVENT\r\n"
        "SUMMARY:Recipe name\r\n"
        "DTSTART;VALUE=DATE:19760710\r\n"
        "DTEND;VALUE=DATE:19760711\r\n"
        f"DTSTAMP:{to_ical_time(scheduled_c.created)}\r\n"
        "UID:<id-removed>\r\n"
        f"CREATED:{to_ical_time(scheduled_c.created)}\r\n"
        "DESCRIPTION:Takes about 1 hour\r\n"
        f"LAST-MODIFIED:{to_ical_time(scheduled_c.created)}\r\n"
        "TRANSP:TRANSPARENT\r\n"
        f"URL:https://recipeyak.com/recipes/{scheduled_c.recipe_id}-recipe-name\r\n"
        "END:VEVENT\r\n"
        "END:VCALENDAR\r\n"
    )


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
    url = url = f"/api/v1/t/{team.pk}/calendar/"
    client.force_login(user)

    res = client.get(url, {"start": date(1976, 1, 1), "end": date(1977, 1, 1), "v2": 1})
    assert res.status_code == 200
    calendar_link = res.json()["settings"]["calendarLink"]

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
