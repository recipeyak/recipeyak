import pytest

from django.conf import settings
from rest_framework import status

pytestmark = pytest.mark.django_db

BASE_URL = f'/{settings.API_BASE_URL}'


def test_cart_item_model(client, user, recipe):
    """
    ensure that a cart item uses a recipe as its primary key
    """
    assert recipe.pk == recipe.cartitem.pk


def test_fetching_single_cart_item(client, user, recipe):
    """
    ensure that a user can fetch an individual cart item
    """
    client.force_authenticate(user)

    res = client.get(f'{BASE_URL}/cart/{recipe.pk}/')
    assert res.status_code == status.HTTP_200_OK
    assert res.json() is not None

    assert res.json().get('recipe') == recipe.pk


def test_fetching_cart(client, user, recipe):
    """
    ensure that a user can fetch a list of cart items
    """
    client.force_authenticate(user)

    res = client.get(f'{BASE_URL}/cart/')
    assert res.status_code == status.HTTP_200_OK
    assert res.json() is not None

    assert isinstance(res.json(), list)


def test_deleting_cart_item(client, user, recipe):
    """
    ensure that the user can't delete a cartitem
    """
    client.force_authenticate(user)

    res = client.delete(f'{BASE_URL}/cart/{recipe.id}/')
    assert res.status_code == status.HTTP_405_METHOD_NOT_ALLOWED


def test_setting_cart_item_count(client, user, recipe):
    """
    ensure that the user can set the cart item
    """
    client.force_authenticate(user)

    res = client.delete(f'{BASE_URL}/cart/{recipe.id}/')
    assert res.status_code == status.HTTP_405_METHOD_NOT_ALLOWED


def test_user_creating_cart_item(client, user, recipe):
    """
    ensure that a user can't create a cart item
    """
    client.force_authenticate(user)

    res = client.post(f'{BASE_URL}/cart/', {})
    assert res.status_code == status.HTTP_405_METHOD_NOT_ALLOWED
