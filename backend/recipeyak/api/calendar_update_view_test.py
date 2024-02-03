from datetime import UTC, date, datetime

import pytest
from django.test.client import Client

from recipeyak.models import Recipe, ScheduledRecipe, ScheduleEvent, Team, User

pytestmark = pytest.mark.django_db


def test_updating_scheduled_recipe(
    client: Client,
    user: User,
    team: Team,
    scheduled_recipe: ScheduledRecipe,
) -> None:
    scheduled_recipe.team = team
    scheduled_recipe.save()
    url = f"/api/v1/calendar/{scheduled_recipe.id}/"
    data = {"on": date(1976, 1, 3)}
    client.force_login(user)
    res = client.patch(url, data, content_type="application/json")
    assert res.status_code == 200
    scheduled_recipe.refresh_from_db()
    assert scheduled_recipe.on == date(1976, 1, 3)


def test_updating_scheduled_recipe_on_date(
    client: Client,
    user: User,
    team: Team,
    scheduled_recipe: ScheduledRecipe,
) -> None:
    """
    ensure updating schedule `on` date records a change event
    """
    scheduled_recipe.team = team
    scheduled_recipe.save()
    assert (
        ScheduleEvent.objects.filter(scheduled_recipe_id=scheduled_recipe.id).count()
        == 0
    )
    client.force_login(user)
    res = client.patch(
        f"/api/v1/calendar/{scheduled_recipe.id}/",
        {"on": datetime.now(UTC).date()},
        content_type="application/json",
    )
    assert res.status_code == 200
    assert (
        ScheduleEvent.objects.filter(scheduled_recipe_id=scheduled_recipe.id).count()
        == 1
    )


def test_updating_team_schedule_recipe(
    client: Client,
    user: User,
    team: Team,
    recipe: Recipe,
) -> None:
    scheduled = recipe.schedule(on=date(1976, 1, 2), team=team, user=user)
    url = f"/api/v1/calendar/{scheduled.id}/"
    data = {"on": date(1976, 1, 3)}
    client.force_login(user)
    res = client.patch(url, data, content_type="application/json")
    assert res.status_code == 200
    assert ScheduledRecipe.objects.get(id=scheduled.id).on == date(1976, 1, 3)
