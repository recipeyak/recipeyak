from datetime import timedelta
from typing import Optional

from django.http import HttpRequest, HttpResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.http import http_date
from django.utils.text import slugify
from django.views.decorators.http import require_http_methods

from core.ical.utils import create_calendar, create_event
from core.models import Membership, ScheduledRecipe, Team


@require_http_methods(["GET", "HEAD"])
def get_ical_view(request: HttpRequest, team_id: int, ical_id: str) -> HttpResponse:
    """
    Return an icalendar formatted string of scheduled recipes.

    We limit the recipes to the last year to avoid having the response size
    gradually increasing & time.
    """
    membership = Membership.objects.filter(
        team_id=team_id, calendar_secret_key=ical_id, calendar_sync_enabled=True
    ).first()
    if membership is not None:
        team = membership.team
    else:
        # deprecated url
        team = get_object_or_404(Team, id=team_id, ical_id=ical_id)

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

    last_modified_scheduled: Optional[ScheduledRecipe] = (
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
