"""
iCalendar creation (not parsing)
https://datatracker.ietf.org/doc/html/rfc5545

generate .ics files so calendar apps can see the scheduled recipes

trying to be more efficient than icalendar
"""
from __future__ import annotations

import textwrap
from collections.abc import Sequence
from dataclasses import dataclass
from datetime import date, datetime
from typing import Literal


def _ical_escape(text: str) -> str:
    """Format value according to iCalendar TEXT escaping rules."""
    # taken from icalendar
    return (
        text.replace(r"\N", "\n")
        .replace("\\", "\\\\")
        .replace(";", r"\;")
        .replace(",", r"\,")
        .replace("\r\n", r"\n")
        .replace("\n", r"\n")
    )


def _ical_fold(input_line: str) -> str:
    """
    https://datatracker.ietf.org/doc/html/rfc5545#section-3.1
    """
    max_length = 75
    if len(input_line) < max_length:
        return input_line

    return "\r\n ".join(
        textwrap.wrap(
            input_line,
            width=max_length,
            expand_tabs=False,
            replace_whitespace=False,
            drop_whitespace=False,
            break_on_hyphens=False,
        )
    )


_ICAL_DATETIME_FORMAT = "%Y%m%dT%H%M%SZ"
_ICAL_DATE_FORMAT = "%Y%m%d"


@dataclass(frozen=True, slots=True, kw_only=True)
class Event:
    """
    VEVENT
    """

    id: str
    start: date
    end: date
    summary: str
    description: str
    url: str
    transparent: Literal["TRANSPARENT", "OPAQUE"]
    created: datetime
    modified: datetime


def _event_to_ics(event: Event) -> str:
    """
    example:

    BEGIN:VEVENT
    UID:core_scheduledrecipe:2993
    DTSTART;VALUE=DATE:20240210
    DTEND;VALUE=DATE:20240211
    SUMMARY:Lemon Yogurt Cheesecake
    DESCRIPTION:Takes about 6 hours\, 15 mins
    URL:https://recipeyak.com/recipes/639-lemon-yogurt-cheesecake
    TRANSP:TRANSPARENT
    CREATED:20231215T045822Z
    DTSTAMP:20231215T045822Z
    LAST-MODIFIED:20231215T045822Z
    END:VEVENT
    """
    out = "BEGIN:VEVENT\r\n"
    out += _ical_fold(f"UID:{_ical_escape(event.id)}") + "\r\n"
    out += f"DTSTART;VALUE=DATE:{event.start.strftime(_ICAL_DATE_FORMAT)}\r\n"
    out += f"DTEND;VALUE=DATE:{event.end.strftime(_ICAL_DATE_FORMAT)}\r\n"
    out += _ical_fold(f"SUMMARY:{_ical_escape(event.summary)}") + "\r\n"
    out += _ical_fold(f"DESCRIPTION:{_ical_escape(event.description)}") + "\r\n"
    out += _ical_fold(f"URL:{_ical_escape(event.url)}") + "\r\n"
    out += f"TRANSP:{event.transparent}\r\n"
    out += f"CREATED:{event.created.strftime(_ICAL_DATETIME_FORMAT)}\r\n"
    modified = event.modified.strftime(_ICAL_DATETIME_FORMAT)
    out += f"DTSTAMP:{modified}\r\n"
    out += f"LAST-MODIFIED:{modified}\r\n"
    out += "END:VEVENT\r\n"
    return out


def calendar(*, id: str, name: str, description: str, events: Sequence[Event]) -> str:
    """
    example output:

    BEGIN:VCALENDAR
    PRODID:-//Recipe Yak//Schedule//EN
    CALSCALE:GREGORIAN
    VERSION:2.0
    X-WR-CALNAME:Scheduled Recipes
    X-WR-CALDESC:Recipe Yak Schedule for Team Foo
    BEGIN:VEVENT
    UID:core_scheduledrecipe:3072
    DTSTART;VALUE=DATE:20240214
    DTEND;VALUE=DATE:20240215
    SUMMARY:Green Goddess Chicken Salad Sandwiches
    DESCRIPTION:Takes about 25 mins
    URL:https://recipeyak.com/recipes/664-green-goddess-chicken-salad-sandwich
    es
    TRANSP:TRANSPARENT
    CREATED:20240124T021159Z
    DTSTAMP:20240124T021159Z
    LAST-MODIFIED:20240124T021159Z
    END:VEVENT
    END:VCALENDAR
    """
    out = "BEGIN:VCALENDAR\r\n"
    out += _ical_fold(f"PRODID:{_ical_escape(id)}") + "\r\n"
    out += "CALSCALE:GREGORIAN\r\nVERSION:2.0\r\n"
    out += _ical_fold(f"X-WR-CALNAME:{_ical_escape(name)}") + "\r\n"
    out += _ical_fold(f"X-WR-CALDESC:{_ical_escape(description)}") + "\r\n"
    for event in events:
        out += _event_to_ics(event)
    out += "END:VCALENDAR\r\n"
    return out
