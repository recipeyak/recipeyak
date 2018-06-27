import pytest

from django.urls import reverse
from rest_framework import status
from datetime import date

from core.models import (
    ScheduledRecipe,
    Recipe,
)

pytestmark = pytest.mark.django_db


def test_adding_to_team_calendar(client, user, team, recipe):
    url = reverse('team-calendar-list', kwargs={'team_pk': team.pk})
    data = {
        'recipe': recipe.id,
        'on': date(1976, 7, 6),
        'count': 1,
    }
    assert team.is_member(user)
    client.force_authenticate(user)
    res = client.post(url, data)
    assert res.status_code == status.HTTP_201_CREATED
    scheduled =  ScheduledRecipe.objects.get(id=res.json().get('id'))
    assert scheduled.team.pk == team.pk


def test_removing_from_team_calendar(client, user, team, recipe):
    scheduled = recipe.schedule(on=date(1976,1,2), team=team)
    url = reverse('team-calendar-detail', kwargs={'team_pk': team.pk, 'pk': scheduled.id})
    client.force_authenticate(user)
    res = client.delete(url)
    assert res.status_code == status.HTTP_204_NO_CONTENT
    assert not ScheduledRecipe.objects.filter(id=scheduled.id).exists()


def test_updating_team_schedule_recipe(client, user, team, recipe):
    scheduled = recipe.schedule(on=date(1976,1,2), team=team)
    assert scheduled.count == 1
    url = reverse('team-calendar-detail', kwargs={'team_pk': team.pk, 'pk': scheduled.id})
    data = {
        'count': 2
    }
    client.force_authenticate(user)
    res = client.patch(url, data)
    assert res.status_code == status.HTTP_200_OK
    assert ScheduledRecipe.objects.get(id=scheduled.id).count == 2


def test_fetching_team_calendar(client, user, team, recipe):
    url = reverse('team-calendar-list', kwargs={'team_pk': team.pk})

    client.force_authenticate(user)
    res = client.get(url)
    assert res.status_code == status.HTTP_400_BAD_REQUEST, \
        "not providing start and end should result in a bad request"

    recipe.schedule(on=date(1976,1,2), team=team)

    res = client.get(url, {'start': date(1976, 1, 1), 'end': date(1977, 1, 1)})
    assert res.status_code == status.HTTP_200_OK
    assert recipe.id in [x['id'] for x in res.json()]

