from datetime import date, datetime
from email.utils import parsedate_to_datetime

import pytest
from rest_framework import status
from rest_framework.test import APIClient

from core.ical.utils import to_ical_time
from core.models import MyUser, Recipe, ScheduledRecipe, Team, get_random_ical_id

pytestmark = pytest.mark.django_db


def test_ical_view_with_invalid_id(client: APIClient, user: MyUser, team: Team) -> None:
    """
    We should return a 404 when a user doesn't pass the correct id for the schedule.
    """
    fake_team_id = get_random_ical_id()
    assert str(team.ical_id) != fake_team_id

    res = client.get(f"/t/{team.id}/ical/{fake_team_id}/schedule.ics")
    assert res.status_code == status.HTTP_404_NOT_FOUND


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


def test_ical_view_with_correct_id(
    client: APIClient, user: MyUser, recipe: Recipe, team: Team
) -> None:
    """
    When the client passes in the correct id we should return the ical data.
    We omit the ids to make the snapshot style test work with the random
    uuids used by the calendar entries.
    """

    scheduled_a = ScheduledRecipe.objects.create(
        recipe=recipe, team=team, on=date(1976, 7, 6), count=1
    )
    scheduled_b = ScheduledRecipe.objects.create(
        recipe=recipe, team=team, on=date(1976, 7, 7), count=2
    )
    scheduled_c = ScheduledRecipe.objects.create(
        recipe=recipe, team=team, on=date(1976, 7, 10), count=2
    )

    url = f"/t/{team.id}/ical/{team.ical_id}/schedule.ics"
    res = client.get(url)
    assert res.status_code == status.HTTP_200_OK
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
        f"URL:https://recipeyak.com/recipes/{scheduled_a.recipe_id}\r\n"
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
        f"URL:https://recipeyak.com/recipes/{scheduled_b.recipe_id}\r\n"
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
        f"URL:https://recipeyak.com/recipes/{scheduled_c.recipe_id}\r\n"
        "END:VEVENT\r\n"
        "END:VCALENDAR\r\n"
    )
