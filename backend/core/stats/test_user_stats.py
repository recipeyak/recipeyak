from datetime import datetime, timedelta

import pytest
import pytz
from django.urls import reverse
from rest_framework import status

from core.models import Recipe

pytestmark = pytest.mark.django_db


def test_user_stats(client, user, recipe, recipe_pie):
    """
    ensure a user can update a recipe
    """
    client.force_authenticate(user)

    month = datetime.today().month

    recipe.edits = 5
    recipe.save()
    recipe_pie.edits = 10
    recipe_pie.save()

    # expected = {
    #     'date_joined': 'Dec, 2017',
    #     'total_recipe_edits': 5,
    #     'new_recipes_last_week': 2,
    #     'recipes_pie_not_pie': [2, 3],
    #     'recipes_added_by_month': [{
    #         'c': 2,
    #         'month': '2017-11-01T00:00:00Z'
    #     }],
    # }

    url = reverse("user-stats")
    res = client.get(url)

    data = res.json()

    assert res.status_code == status.HTTP_200_OK

    assert datetime.strptime(data.get("date_joined"), "%b, %Y").month == month

    assert data.get("total_recipe_edits") == 15

    assert data.get("new_recipes_last_week") == 2

    assert data.get("recipes_pie_not_pie") == [1, 2]

    assert data.get("recipes_added_by_month")[0].get("c") == 2

    assert data.get("total_user_recipes") == 2


def test_total_recipes_added_last_month_by_all_users(client, user, user2):
    client.force_authenticate(user)

    name = "Recipe name"
    author = "Recipe author"

    count = 5
    for _ in range(count):
        Recipe.objects.create(name=name, author=author, owner=user2)

    Recipe.objects.update(created=datetime.now(tz=pytz.UTC) - timedelta(days=60))

    # we know that the datetime.now() that will be used for the following
    # recipe will be within the last month
    Recipe.objects.create(name=name, author=author, owner=user2)

    url = reverse("user-stats")
    res = client.get(url)
    assert res.status_code == status.HTTP_200_OK
    assert res.json().get("total_recipes_added_last_month_by_all_users") == 1
