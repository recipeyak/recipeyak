from datetime import date, datetime, timezone

import pytest
from rest_framework import status
from rest_framework.test import APIClient

from recipeyak.models import Recipe, ScheduledRecipe, ScheduleEvent, Team, User

pytestmark = pytest.mark.django_db


def test_creating_scheduled_recipe(
    client: APIClient, recipe: Recipe, team: Team, user: User
) -> None:
    recipe.team = team
    recipe.save()
    url = f"/api/v1/t/{team.id}/calendar/"
    data = {"recipe": recipe.id, "on": date(1976, 7, 6)}
    client.force_authenticate(user)
    res = client.post(url, data)
    assert res.status_code == status.HTTP_201_CREATED
    assert ScheduledRecipe.objects.filter(id=res.json()["id"]).exists()
    assert res.json()[
        "created"
    ], "ensure we have the created at property for sorting on the frontend"


def test_updating_scheduled_recipe(
    client: APIClient, user: User, team: Team, scheduled_recipe: ScheduledRecipe
) -> None:
    scheduled_recipe.team = team
    scheduled_recipe.save()

    url = f"/api/v1/t/{team.id}/calendar/{scheduled_recipe.id}/"
    data = {"on": date(1976, 1, 3)}
    client.force_authenticate(user)
    res = client.patch(url, data)
    assert res.status_code == status.HTTP_200_OK
    scheduled_recipe.refresh_from_db()
    assert scheduled_recipe.on == date(1976, 1, 3)


def test_updating_scheduled_recipe_on_date(
    client: APIClient, user: User, team: Team, scheduled_recipe: ScheduledRecipe
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
    client.force_authenticate(user)
    res = client.patch(
        f"/api/v1/t/{team.id}/calendar/{scheduled_recipe.id}/",
        {"on": datetime.now(timezone.utc).date()},
    )
    assert res.status_code == status.HTTP_200_OK
    assert (
        ScheduleEvent.objects.filter(scheduled_recipe_id=scheduled_recipe.id).count()
        == 1
    )


def test_deleting_scheduled_recipe(
    client: APIClient, user: User, team: Team, scheduled_recipe: ScheduledRecipe
) -> None:
    scheduled_recipe.team = team
    scheduled_recipe.save()
    url = f"/api/v1/t/{team.id}/calendar/{scheduled_recipe.id}/"
    client.force_authenticate(user)
    res = client.delete(url)
    assert res.status_code == status.HTTP_204_NO_CONTENT
    assert not ScheduledRecipe.objects.filter(id=scheduled_recipe.id).exists()


def test_deleting_recipe_deletes_scheduled_recipes(
    recipe: Recipe, scheduled_recipe: ScheduledRecipe, user: User
) -> None:
    """
    doesn't work when soft-delete was enabled...
    """
    assert scheduled_recipe.recipe.id == recipe.id
    recipe.delete()
    assert not Recipe.objects.filter(id=recipe.id).exists()
    assert not ScheduledRecipe.objects.filter(id=scheduled_recipe.id).exists()


def test_schedule_for_recipe_method(recipe: Recipe, user: User, team: Team) -> None:
    s = recipe.schedule(user=user, on=date(1976, 1, 1), team=team)
    assert ScheduledRecipe.objects.get(id=s.id) == s
