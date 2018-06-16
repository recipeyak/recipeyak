import pytest

from django.conf import settings
from rest_framework import status

from .models import Step

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

    client.force_authenticate(None)

    res = client.get(f'{BASE_URL}/recipes/{recipe.id}/')
    assert res.status_code == status.HTTP_403_FORBIDDEN


def test_accessing_step_of_other_user(client, recipe, user2):
    """
    ensure 404 when access other user's step
    """

    step = Step.objects.get(recipe=recipe)

    client.force_authenticate(user2)

    res = client.get(f'{BASE_URL}/steps/{step.id}/')
    assert res.status_code == status.HTTP_404_NOT_FOUND

    client.force_authenticate(None)

    res = client.get(f'{BASE_URL}/steps/{step.id}/')
    assert res.status_code == status.HTTP_404_NOT_FOUND
