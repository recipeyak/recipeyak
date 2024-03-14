from datetime import datetime, timedelta
from typing import Any

import sentry_sdk
from django.db import connection
from django.http import HttpRequest, HttpResponse
from django.utils.text import slugify
from django.views.decorators.http import require_http_methods

from recipeyak.ical import Event, calendar


@require_http_methods(["GET", "HEAD"])
def ical_retrieve_view(
    request: HttpRequest, team_id: int, ical_id: str
) -> HttpResponse:
    """
    Return an icalendar formatted string of scheduled recipes.

    We limit the recipes to the last year to avoid having the response size
    gradually increasing & time.
    """
    with connection.cursor() as cursor:
        cursor.execute(
            """
select
  json_object(
    'team_name': core_team.name,
    'scheduled_recipes': (
      select json_agg(scheduled_recipe)
      from (
        select json_object(
          'id': scheduled_recipe.id,
          'on': scheduled_recipe."on",
          'created': scheduled_recipe.created,
          'recipe_id': recipe.id,
          'recipe_time': recipe.time,
          'recipe_name': recipe.name
        ) scheduled_recipe
        from core_scheduledrecipe scheduled_recipe
        join core_recipe recipe on scheduled_recipe.recipe_id = recipe.id
        where scheduled_recipe.created > now() - '2 years'::interval
        and scheduled_recipe.team_id = %(team_id)s
        order by "on"
      ) sub
    )
  )
from
  core_membership
  join core_team on core_team.id = core_membership.team_id
where
  calendar_sync_enabled
  and team_id = %(team_id)s
  and calendar_secret_key = %(calendar_secret_key)s
""",
            {"team_id": team_id, "calendar_secret_key": ical_id},
        )
        row = cursor.fetchone()
        if row is None:
            return HttpResponse(status=404)
        col: dict[str, Any] = row[0]
        team_name: str = col["team_name"]
        scheduled_recipes: list[dict[str, Any]] = col["scheduled_recipes"] or []

    with sentry_sdk.start_span(
        op="recipeyak.ical.render", description="create icalendar"
    ):
        events = []
        for s in scheduled_recipes:
            description = f"Takes about {s['recipe_time']}" if s["recipe_time"] else ""
            slug_name = slugify(s["recipe_name"])
            start_date = datetime.fromisoformat(s["on"])
            created = datetime.fromisoformat(s["created"])
            events.append(
                Event(
                    id=f"core_scheduledrecipe:{s['id']}",
                    description=description,
                    url=f"https://recipeyak.com/recipes/{s['recipe_id']}-{slug_name}",
                    start=start_date,
                    end=start_date + timedelta(days=1),
                    created=created,
                    transparent="TRANSPARENT",
                    summary=s["recipe_name"],
                    modified=created,
                )
            )
        cal = calendar(
            id="-//Recipe Yak//Schedule//EN",
            name="Scheduled Recipes",
            description=f"Recipe Yak Schedule for Team {team_name}",
            events=events,
        )
        response = HttpResponse()
        response["Content-Type"] = "text/calendar"
        response.content = cal
    return response
