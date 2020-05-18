from datetime import date, datetime
from typing import Sequence, cast
from uuid import uuid4

from icalendar import Calendar, Event, vDate, vDatetime


def create_event(
    *,
    name: str,
    description: str,
    url: str,
    start_date: date,
    end_date: date,
    created: datetime,
) -> Event:
    event = Event(
        uid=str(uuid4()),
        dtstart=vDate(start_date),
        dtend=vDate(end_date),
        summary=name,
        description=description,
        url=url,
        transp="TRANSPARENT",  # if it is a date, then we use TRANSPARENT, else OPAQUE
        created=vDatetime(created),
        dtstamp=vDatetime(created),
    )
    event["LAST-MODIFIED"] = vDatetime(created)
    return event


def create_calendar(
    *, name: str, description: str, events: Sequence[Event]
) -> Calendar:
    cal = Calendar(
        prodid="-//Recipe Yak//Schedule//EN", calscale="GREGORIAN", version=2.0
    )
    cal["x-wr-calname"] = name
    cal["x-wr-caldesc"] = description
    for event in events:
        cal.add_component(event)
    return cal


def to_ical_time(date: datetime) -> str:
    return cast(str, vDatetime(date).to_ical().decode())
