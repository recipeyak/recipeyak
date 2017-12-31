import datetime
import pytest

from django.conf import settings
from rest_framework import status

pytestmark = pytest.mark.django_db

BASE_URL = f'/{settings.API_BASE_URL}'


def test_user_stats(client, user, recipe, recipe_pie):
    """
    ensure a user can update a recipe
    """
    client.force_authenticate(user)

    month = datetime.datetime.today().month

    recipe.cart_additions = 5
    recipe.edits = 5
    recipe_pie.edits = 10

    recipe.save()
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

    assert datetime.datetime.strptime(data.get('date_joined'), '%b, %Y').month == month

    assert data.get('most_added_recipe').get('id') == recipe.id

    assert data.get('total_recipe_edits') == 15

    assert data.get('new_recipes_last_week') == 2

    assert data.get('recipes_pie_not_pie') == [1, 2]

    assert data.get('recipes_added_by_month')[0].get('c') == 2


def test_total_recipes_added_last_month_by_all_users(client, user, recipe):
    client.force_authenticate(user)
    res = client.get(f'{BASE_URL}/user_stats/')
    assert res.status_code == status.HTTP_200_OK
    assert res.json().get('total_recipes_added_last_month_by_all_users') == 1


def test_cart_additions_in_last_month(client, user, recipe):
    cart_additions = 7
    recipe.cart_additions = cart_additions
    recipe.save()

    client.force_authenticate(user)
    res = client.get(f'{BASE_URL}/user_stats/')
    assert res.status_code == status.HTTP_200_OK
    assert res.json().get('cart_additions_in_last_month') == cart_additions
