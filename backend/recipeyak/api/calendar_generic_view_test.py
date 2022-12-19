from datetime import date, datetime

import pytest
from rest_framework import status
from rest_framework.test import APIClient

from recipeyak.models import Recipe, ScheduledRecipe, ScheduleEvent, User

pytestmark = pytest.mark.django_db


def test_creating_scheduled_recipe(
    client: APIClient, recipe: Recipe, user: User
) -> None:
    url = "/api/v1/t/me/calendar/"
    data = {"recipe": recipe.id, "on": date(1976, 7, 6), "count": 1}
    client.force_authenticate(user)
    res = client.post(url, data)
    assert res.status_code == status.HTTP_201_CREATED
    assert ScheduledRecipe.objects.filter(id=res.json()["id"]).exists()
    assert res.json()[
        "created"
    ], "ensure we have the created at property for sorting on the frontend"


def test_recipe_returns_last_scheduled_date(
    client: APIClient, scheduled_recipe: ScheduledRecipe, recipe2: Recipe
) -> None:
    recipe = scheduled_recipe.recipe
    user = scheduled_recipe.user
    client.force_authenticate(user)
    res = client.get(f"/api/v1/recipes/{recipe.id}/")
    assert res.status_code == status.HTTP_200_OK
    assert res.json()["last_scheduled"] == str(scheduled_recipe.on)

    res = client.get(f"/api/v1/recipes/{recipe2.id}/")
    assert res.status_code == status.HTTP_200_OK
    assert (
        res.json()["last_scheduled"] is None
    ), "We return None if the recipe has not been scheduled"


def test_updating_scheduled_recipe(
    client: APIClient, user: User, scheduled_recipe: ScheduledRecipe
) -> None:
    url = f"/api/v1/t/me/calendar/{scheduled_recipe.id}/"
    assert scheduled_recipe.count == 1
    data = {"count": 2}
    client.force_authenticate(user)
    res = client.patch(url, data)
    assert res.status_code == status.HTTP_200_OK
    assert ScheduledRecipe.objects.get(id=scheduled_recipe.id).count == 2


def test_updating_scheduled_recipe_on_date(
    client: APIClient, user: User, scheduled_recipe: ScheduledRecipe
) -> None:
    """
    ensure updating schedule `on` date records a change event
    """
    assert scheduled_recipe.count == 1
    assert (
        ScheduleEvent.objects.filter(scheduled_recipe_id=scheduled_recipe.id).count()
        == 0
    )
    client.force_authenticate(user)
    res = client.patch(
        f"/api/v1/t/me/calendar/{scheduled_recipe.id}/", {"on": datetime.now().date()}
    )
    assert res.status_code == status.HTTP_200_OK
    assert ScheduledRecipe.objects.get(id=scheduled_recipe.id).count == 1

    assert (
        ScheduleEvent.objects.filter(scheduled_recipe_id=scheduled_recipe.id).count()
        == 1
    )


def test_deleting_scheduled_recipe(
    client: APIClient, user: User, scheduled_recipe: ScheduledRecipe
) -> None:
    url = f"/api/v1/t/me/calendar/{scheduled_recipe.id}/"
    client.force_authenticate(user)
    res = client.delete(url)
    assert res.status_code == status.HTTP_204_NO_CONTENT
    assert not ScheduledRecipe.objects.filter(id=scheduled_recipe.id).exists()


def test_fetching_scheduled_recipes(
    client: APIClient, user: User, scheduled_recipe: ScheduledRecipe
) -> None:
    url = "/api/v1/t/me/calendar/"
    client.force_authenticate(user)
    res = client.get(url)
    assert (
        res.status_code == status.HTTP_400_BAD_REQUEST
    ), "not providing start and end should result in a bad request"

    res = client.get(url, {"start": date(1976, 1, 1), "end": date(1977, 1, 1)})
    assert res.status_code == status.HTTP_200_OK
    assert any(x["id"] == scheduled_recipe.id for x in res.json())
    assert res.json()[0][
        "created"
    ], "ensure we have the created at property for sorting on the frontend"


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


def test_schedule_for_recipe_method(recipe: Recipe, user: User) -> None:
    s = recipe.schedule(user=user, on=date(1976, 1, 1), count=2)
    assert ScheduledRecipe.objects.get(id=s.id) == s


def test_scheduling_the_same_recipe_twice_on_a_day(recipe: Recipe, user: User) -> None:
    on = date(1976, 1, 1)
    recipe.schedule(user=user, on=on, count=2)
    recipe.schedule(user=user, on=on, count=1)
    assert ScheduledRecipe.objects.get(recipe=recipe, on=on, user=user).count == 3


def test_dupe_scheduling_with_http(
    client: APIClient, recipe: Recipe, user: User
) -> None:
    client.force_authenticate(user)
    url = "/api/v1/t/me/calendar/"
    data = {"recipe": recipe.id, "on": date(1976, 7, 6), "count": 1}
    client.force_authenticate(user)
    assert client.post(url, data).status_code == status.HTTP_201_CREATED
    res = client.post(url, data)
    assert res.status_code == status.HTTP_201_CREATED

    assert res.json().get("count") == 2
    assert ScheduledRecipe.objects.get(id=res.json().get("id")).count == 2
