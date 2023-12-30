from collections.abc import Sequence
from datetime import date, datetime, timedelta
from typing import cast

from django.http import HttpRequest, HttpResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.http import http_date
from django.utils.text import slugify
from django.views.decorators.http import require_http_methods
from icalendar import Calendar, Event, vDate, vDatetime

from recipeyak.models import Membership, ScheduledRecipe


def create_event(
    *,
    id: str,
    name: str,
    description: str,
    url: str,
    start_date: date,
    end_date: date,
    created: datetime,
) -> Event:
    event = Event(
        uid=id,
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


@require_http_methods(["GET", "HEAD"])
def ical_retrieve_view(
    request: HttpRequest, team_id: int, ical_id: str
) -> HttpResponse:
    """
    Return an icalendar formatted string of scheduled recipes.

    We limit the recipes to the last year to avoid having the response size
    gradually increasing & time.
    """
    membership = get_object_or_404(
        Membership.objects.filter(
            calendar_sync_enabled=True,
            team_id=team_id,
            calendar_secret_key=ical_id,
        )
    )
    team = membership.team

    scheduled_recipes = (
        ScheduledRecipe.objects.filter(team=team)
        .filter(created__gte=timezone.now() - timedelta(weeks=52))
        .select_related("recipe")
        .order_by("on")
    )

    events = []
    for scheduled_recipe in scheduled_recipes:
        recipe = scheduled_recipe.recipe
        description = f"Takes about {recipe.time}" if recipe.time else ""
        slug_name = slugify(recipe.name)
        events.append(
            create_event(
                # prefix with table name to ensure uniqueness of the primary key
                id=f"core_scheduledrecipe:{scheduled_recipe.id}",
                name=recipe.name,
                description=description,
                url=f"https://recipeyak.com/recipes/{recipe.id}-{slug_name}",
                start_date=scheduled_recipe.on,
                end_date=scheduled_recipe.on + timedelta(days=1),
                created=scheduled_recipe.created,
            )
        )
    cal = create_calendar(
        name="Scheduled Recipes",
        description=f"Recipe Yak Schedule for Team {team.name}",
        events=events,
    )

    last_modified_scheduled = (
        ScheduledRecipe.objects.filter(team=team).order_by("-modified").first()
    )

    response = HttpResponse()
    response["Content-Type"] = "text/calendar"
    if last_modified_scheduled is not None:
        response["Last-Modified"] = http_date(
            last_modified_scheduled.modified.timestamp()
        )
    response.content = cal.to_ical()
    return response