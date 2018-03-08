import pytest

from django.urls import reverse
from django.urls.exceptions import NoReverseMatch
from rest_framework import status

from .models import CartItem

pytestmark = pytest.mark.django_db


def test_fetching_single_cart_item(client, user, recipe):
    """
    ensure that fetching via /cart is disabled
    we fetch cart data via a nested object in /recipes/<id>
    """
    client.force_authenticate(user)

    url = reverse('cart', kwargs={'pk': recipe.pk})
    res = client.get(url)
    assert res.status_code == status.HTTP_405_METHOD_NOT_ALLOWED


def test_fetching_cart(client, user, recipe):
    """
    ensure that a user cannot fetch a list of cart items
    """
    client.force_authenticate(user)

    with pytest.raises(NoReverseMatch):
        reverse('cart')


def test_deleting_cart_item(client, user, recipe):
    """
    ensure that the user can't delete a cartitem
    """
    client.force_authenticate(user)

    url = reverse('cart', kwargs={'pk': recipe.pk})
    res = client.delete(url)
    assert res.status_code == status.HTTP_405_METHOD_NOT_ALLOWED


def test_setting_cart_item_count(client, user, recipe):
    """
    ensure that the user can set the cart item
    """
    client.force_authenticate(user)

    count = 2

    url = reverse('cart', kwargs={'pk': recipe.pk})
    res = client.patch(url, {'count': count})
    assert res.status_code == status.HTTP_200_OK
    assert res.json()['count'] == count
    assert CartItem.objects.filter(user=user).get(recipe__pk=recipe.pk).count == count


def test_user_creating_cart_item(client, user, recipe):
    """
    ensure that a user can't create a cart item
    """
    client.force_authenticate(user)

    with pytest.raises(NoReverseMatch):
        reverse('cart')


def test_clearing_cart(client, user, team, recipe, recipe2):
    """
    user can clear the cart via a delete call on the cart
    """

    client.force_authenticate(user)

    # 1. ensure each cart item has a value greater than 1
    cart_count = 2
    for r in (recipe, recipe2):
        url = reverse('cart', kwargs={'pk': r.id})
        assert client.patch(url, {'count': cart_count}).status_code == status.HTTP_200_OK
        assert CartItem.objects.get(recipe__pk=r.id, user=user).count == cart_count

    # 2. 'delete' the cart (clear the items)
    assert client.post(reverse('clear-cart')).status_code == status.HTTP_200_OK

    # 3. ensure the cart items were reset to 0
    for r in (recipe, recipe2):
        assert CartItem.objects.get(recipe__pk=r.id, user=user).count == 0

    # test cart items with a recipe owned by a team
    assert team.is_member(user)

    recipe = recipe.move_to(team)

    url = reverse('cart', kwargs={'pk': recipe.id})
    assert client.patch(url, {'count': cart_count}).status_code == status.HTTP_200_OK
    assert CartItem.objects.get(recipe__pk=recipe.id, user=user).count == cart_count

    assert client.post(reverse('clear-cart')).status_code == status.HTTP_200_OK
    assert CartItem.objects.get(recipe__pk=recipe.id, user=user).count == 0


def test_updating_cart_of_not_owned_recipe(client, recipe, team, user, user2):
    """
    ensure another user can't add a recipe to their cart that they dont' own
    """

    for u, s in ((user, status.HTTP_200_OK),
                 (user2, status.HTTP_403_FORBIDDEN)):
        client.force_authenticate(u)
        url = reverse('cart', kwargs={'pk': recipe.id})
        res = client.patch(url, {'count': 2})
        assert res.status_code == s

    team.force_join(user2)

    assert team.is_member(user2)
    assert team.is_member(user)

    recipe = recipe.move_to(team)

    for u, s in ((user, status.HTTP_200_OK),
                 (user2, status.HTTP_200_OK)):
        client.force_authenticate(u)
        url = reverse('cart', kwargs={'pk': recipe.id})
        res = client.patch(url, {'count': 2})
        assert res.status_code == s
