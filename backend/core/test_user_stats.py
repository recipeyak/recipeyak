from datetime import datetime, timedelta
import pytest
import pytz

from django.urls import reverse
from django.conf import settings
from rest_framework import status

from .models import Recipe

pytestmark = pytest.mark.django_db

BASE_URL = f'/{settings.API_BASE_URL}'


def test_user_stats(client, user, recipe, recipe_pie):
    """
    ensure a user can update a recipe
    """
    client.force_authenticate(user)

    month = datetime.today().month

    recipe.set_cart_quantity(user, 5)
    recipe.edits = 5
    recipe.save()
    recipe_pie.edits = 10
    recipe_pie.save()

    # expected = {
    #     'date_joined': 'Dec, 2017',
    #     'most_added_recipe': {
    #         'author': 'Recipe author',
    #         'id': 23, ...
    #     },
    #     'total_recipe_edits': 5,
    #     'new_recipes_last_week': 2,
    #     'recipes_pie_not_pie': [2, 3],
    #     'recipes_added_by_month': [{
    #         'c': 2,
    #         'month': '2017-11-01T00:00:00Z'
    #     }],
    # }

    res = client.get(f'{BASE_URL}/user_stats/')

    data = res.json()

    assert res.status_code == status.HTTP_200_OK

    assert datetime.strptime(data.get('date_joined'), '%b, %Y').month == month

    assert data.get('most_added_recipe').get('id') == recipe.id

    assert data.get('total_recipe_edits') == 15

    assert data.get('new_recipes_last_week') == 2

    assert data.get('recipes_pie_not_pie') == [1, 2]

    assert data.get('recipes_added_by_month')[0].get('c') == 2

    assert data.get('total_user_recipes') == 2


def test_most_added_recipe_stat(client, user, recipe):
    """
    ensure we have the field necessary for a userhome stat
    """
    recipe.set_cart_quantity(user, 5)

    client.force_authenticate(user)
    url = reverse('user-stats')
    res = client.get(url)
    assert res.status_code == status.HTTP_200_OK
    data = res.json().get('most_added_recipe')
    for field in ['id', 'name', 'total_cart_additions']:
        assert data.get(field) is not None


def test_total_recipes_added_last_month_by_all_users(client, user, user2):
    client.force_authenticate(user)

    name = 'Recipe name'
    author = 'Recipe author'

    count = 5
    for n in range(count):
        Recipe.objects.create(
            name=name,
            author=author,
            owner=user2)

    Recipe.objects.update(
        created=datetime.now(tz=pytz.UTC) - timedelta(days=60))

    # we know that the datetime.now() that will be used for the following
    # recipe will be within the last month
    Recipe.objects.create(
        name=name,
        author=author,
        owner=user2)

    res = client.get(f'{BASE_URL}/user_stats/')
    assert res.status_code == status.HTTP_200_OK
    assert res.json().get('total_recipes_added_last_month_by_all_users') == 1


def test_total_cart_additions(client, user, recipe):
    cart_additions = 7
    recipe.set_cart_quantity(user, cart_additions)

    client.force_authenticate(user)
    res = client.get(f'{BASE_URL}/user_stats/')
    assert res.status_code == status.HTTP_200_OK
    assert res.json().get('total_cart_additions') == cart_additions
