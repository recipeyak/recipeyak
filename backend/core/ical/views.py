from datetime import timedelta
from typing import Optional

from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.http import http_date
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.request import Request

from core.ical.utils import create_calendar, create_event
from core.models import ScheduledRecipe, Team


@api_view(["GET"])
@permission_classes([AllowAny])
def get_ical_view(request: Request, team_id: int, ical_id: str) -> HttpResponse:
    """
    Return an icalendar formatted string of scheduled recipes.

    We limit the recipes to the last year to avoid having the response size
    gradually increasing & time.
    """
    team: Team = get_object_or_404(Team, id=team_id, ical_id=ical_id)

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
        events.append(
            create_event(
                name=recipe.name,
                description=description,
                url=f"https://recipeyak.com/recipes/{recipe.id}",
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

    last_modified_scheduled: Optional[ScheduledRecipe] = ScheduledRecipe.objects.filter(
        team=team
    ).order_by("-modified").first()

    response = HttpResponse()
    response["Content-Type"] = "text/calendar"
    if last_modified_scheduled is not None:
        response["Last-Modified"] = http_date(
            last_modified_scheduled.modified.timestamp()
        )
    response.content = cal.to_ical()
    return response
