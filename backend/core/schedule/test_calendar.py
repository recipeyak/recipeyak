from datetime import date

import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from core.models import Recipe, ScheduledRecipe, Team, MyUser

pytestmark = pytest.mark.django_db


def test_creating_scheduled_recipe(client, recipe, user):
    url = reverse("calendar-list", kwargs=dict(team_pk="me"))
    data = {"recipe": recipe.id, "on": date(1976, 7, 6), "count": 1}
    client.force_authenticate(user)
    res = client.post(url, data)
    assert res.status_code == status.HTTP_201_CREATED
    assert ScheduledRecipe.objects.filter(id=res.json()["id"]).exists()
    assert res.json()[
        "created"
    ], "ensure we have the created at property for sorting on the frontend"


def test_recipe_returns_last_scheduled_date(client, scheduled_recipe, recipe2):
    recipe = scheduled_recipe.recipe
    user = scheduled_recipe.user
    client.force_authenticate(user)
    res = client.get(reverse("recipes-detail", args=[recipe.id]))
    assert res.status_code == status.HTTP_200_OK
    assert res.json()["last_scheduled"] == str(scheduled_recipe.on)

    res = client.get(reverse("recipes-detail", args=[recipe2.id]))
    assert res.status_code == status.HTTP_200_OK
    assert (
        res.json()["last_scheduled"] is None
    ), "We return None if the recipe has not been scheduled"


def test_updating_scheduled_recipe(client, user, scheduled_recipe):
    url = reverse("calendar-detail", kwargs=dict(pk=scheduled_recipe.id, team_pk="me"))
    assert scheduled_recipe.count == 1
    data = {"count": 2}
    client.force_authenticate(user)
    res = client.patch(url, data)
    assert res.status_code == status.HTTP_200_OK
    assert ScheduledRecipe.objects.get(id=scheduled_recipe.id).count == 2


def test_deleting_scheduled_recipe(client, user, scheduled_recipe):
    url = reverse("calendar-detail", kwargs=dict(pk=scheduled_recipe.id, team_pk="me"))
    client.force_authenticate(user)
    res = client.delete(url)
    assert res.status_code == status.HTTP_204_NO_CONTENT
    assert not ScheduledRecipe.objects.filter(id=scheduled_recipe.id).exists()


def test_fetching_scheduled_recipes(client, user, scheduled_recipe):
    url = reverse("calendar-list", kwargs=dict(team_pk="me"))
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


def test_deleting_recipe_deletes_scheduled_recipes(recipe, scheduled_recipe, user):
    """
    doesn't work when soft-delete was enabled...
    """
    assert scheduled_recipe.recipe.id == recipe.id
    recipe.delete()
    assert not Recipe.objects.filter(id=recipe.id).exists()
    assert not ScheduledRecipe.objects.filter(id=scheduled_recipe.id).exists()


def test_schedule_for_recipe_method(recipe, user):
    s = recipe.schedule(user=user, on=date(1976, 1, 1), count=2)
    assert ScheduledRecipe.objects.get(id=s.id) == s


def test_scheduling_the_same_recipe_twice_on_a_day(recipe, user):
    on = date(1976, 1, 1)
    recipe.schedule(user=user, on=on, count=2)
    recipe.schedule(user=user, on=on, count=1)
    assert ScheduledRecipe.objects.get(recipe=recipe, on=on, user=user).count == 3


def test_dupe_scheduling_with_http(client, recipe, user):
    client.force_authenticate(user)
    url = reverse("calendar-list", kwargs=dict(team_pk="me"))
    data = {"recipe": recipe.id, "on": date(1976, 7, 6), "count": 1}
    client.force_authenticate(user)
    assert client.post(url, data).status_code == status.HTTP_201_CREATED
    res = client.post(url, data)
    assert res.status_code == status.HTTP_201_CREATED

    assert res.json().get("count") == 2
    assert ScheduledRecipe.objects.get(id=res.json().get("id")).count == 2


def test_user_precense_view(
    client: APIClient, team: Team, user: MyUser, user2: MyUser
) -> None:
    """
    ensure that only authorized users can access the user precense view
    """
    url = reverse("calendar-presence", kwargs={"team_pk": team.id})
    assert url == f"/api/v1/t/{team.id}/calendar/presence/"

    res = client.post(url)
    assert res.status_code == status.HTTP_403_FORBIDDEN, "no auth provided"

    assert not team.is_member(user2)
    client.force_authenticate(user2)
    res = client.post(url)
    assert res.status_code == status.HTTP_403_FORBIDDEN, "unauthorized user"

    assert team.is_member(user)
    client.force_authenticate(user)
    res = client.post(url)
    assert res.status_code == status.HTTP_200_OK, "authorized user"
