import pytest
from rest_framework import status
from django.urls import reverse
from datetime import date, timedelta


pytestmark = pytest.mark.django_db


def test_fetching_team_shopping_list(client, user, team, recipe):
    start = date(1976, 7, 6)
    end = start + timedelta(days=1)
    params = {
        'start': start,
        'end': end,
    }

    url = reverse('team-shoppinglist-list', kwargs={'team_pk': team.pk})
    client.force_authenticate(user)
    res = client.get(url, params)
    assert res.status_code == status.HTTP_200_OK
    assert res.json() == []

    recipe.schedule(on=start, team=team)
    res = client.get(url, params)
    assert res.status_code == status.HTTP_200_OK
    assert len(res.json()) == len(recipe.ingredients), \
        'only return the schedule recipe ingredients'
