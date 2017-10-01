import pytest

from django.conf import settings
from rest_framework import status

pytestmark = pytest.mark.django_db

BASE_URL = f'/{settings.API_BASE_URL}'


def test_adding_cart_items(client, user, recipe):
    """
    ensure that the user can add an item to the cart
    """
    client.force_authenticate(user)

    data = {
        'recipe': recipe.id,
        'count': 1
    }
    res = client.post(f'{BASE_URL}/cart/', data)
    assert res.status_code == status.HTTP_201_CREATED

    res = client.get(f'{BASE_URL}/cart/')
    assert res.status_code == status.HTTP_200_OK

    expected_data = [
        {
            'id': recipe.id,
            'count': 1
        }
    ]
    assert res.json() == expected_data


def test_update_cart_item(client, user, recipe, cart_item):
    """
    ensure that the user can update an item in their cart
    """
    client.force_authenticate(user)

    res = client.get(f'{BASE_URL}/cart/')
    assert res.status_code == status.HTTP_200_OK
    assert res.json() is not None

    cart_item_id = res.json()[0].get('id')

    new_count = 2
    res = client.patch(f'{BASE_URL}/cart/{cart_item_id}/', {'count': new_count})
    assert res.status_code == status.HTTP_200_OK
    assert res.json().get('count') == new_count


def test_deleting_cart_item(client, user, recipe, cart_item):
    """
    ensure that the user can delete an item from the cart
    """
    client.force_authenticate(user)

    res = client.get(f'{BASE_URL}/cart/')
    assert res.status_code == status.HTTP_200_OK
    assert res.json() is not None

    cart_item_id = res.json()[0].get('id')

    res = client.delete(f'{BASE_URL}/cart/{cart_item_id}/')
    assert res.status_code == status.HTTP_204_NO_CONTENT

    res = client.get(f'{BASE_URL}/cart/{cart_item_id}/')
    assert res.status_code == status.HTTP_404_NOT_FOUND
