import pytest

from django.conf import settings
from rest_framework import status

pytestmark = pytest.mark.django_db

BASE_URL = f'/{settings.API_BASE_URL}'


def test_accessing_recipes(client, user, recipe, user2):
    """
    ensure a user can only access their own recipes
    """
    client.force_authenticate(user)

    res = client.get(f'{BASE_URL}/recipes/{recipe.id}/')
    assert res.status_code == status.HTTP_200_OK

    client.force_authenticate(user2)

    res = client.get(f'{BASE_URL}/recipes/{recipe.id}/')
    assert res.status_code == status.HTTP_404_NOT_FOUND
