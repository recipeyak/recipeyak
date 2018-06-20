import pytest

from django.urls import reverse
from rest_framework import status
from datetime import date

from core.models import (
    ScheduledRecipe,
    Recipe,
)

pytestmark = pytest.mark.django_db


def test_creating_scheduled_recipe(client, recipe, user):
    url = reverse('calendar-list')
    data = {
        'recipe': recipe.id,
        'on': date(1976, 7, 6),
        'count': 1,
    }
    client.force_authenticate(user)
    res = client.post(url, data)
    assert res.status_code == status.HTTP_201_CREATED
    assert ScheduledRecipe.objects.filter(id=res.json().get('id')).exists()


def test_updating_scheduled_recipe(client, user, scheduled_recipe):
    url = reverse('calendar-detail', kwargs={'pk': scheduled_recipe.id})
    assert scheduled_recipe.count == 1
    data = {
        'count': 2
    }
    client.force_authenticate(user)
    res = client.patch(url, data)
    assert res.status_code == status.HTTP_200_OK
    assert ScheduledRecipe.objects.get(id=scheduled_recipe.id).count == 2


def test_deleting_scheduled_recipe(client, user, scheduled_recipe):
    url = reverse('calendar-detail', kwargs={'pk': scheduled_recipe.id})
    client.force_authenticate(user)
    res = client.delete(url)
    assert res.status_code == status.HTTP_204_NO_CONTENT
    assert not ScheduledRecipe.objects.filter(id=scheduled_recipe.id).exists()


def test_fetching_scheduled_recipes(client, user, scheduled_recipe):
    url = reverse('calendar-list')
    client.force_authenticate(user)
    res = client.get(url)
    assert res.status_code == status.HTTP_400_BAD_REQUEST, \
        "not providing start and end should result in a bad request"

    res = client.get(url, {'start': date(1976, 1, 1), 'end': date(1977, 1, 1)})
    assert res.status_code == status.HTTP_200_OK
    assert scheduled_recipe.id in [x['id'] for x in res.json()]


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
    url = reverse('calendar-list')
    data = {
        'recipe': recipe.id,
        'on': date(1976, 7, 6),
        'count': 1,
    }
    client.force_authenticate(user)
    assert client.post(url, data).status_code == status.HTTP_201_CREATED
    res = client.post(url, data)
    assert res.status_code == status.HTTP_201_CREATED

    assert res.json().get('count') == 2
    assert ScheduledRecipe.objects.get(id=res.json().get('id')).count == 2
