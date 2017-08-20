import pytest

from django.conf import settings
from rest_framework import status
from .models import MyUser

pytestmark = pytest.mark.django_db

BASE_URL = f'/{settings.API_BASE_URL}'


def test_signup(client):
    """
    ensure a user can signup
    """
    url = f'{BASE_URL}/rest-auth/user/'
    res = client.get(url)
    assert res.status_code == status.HTTP_401_UNAUTHORIZED

    email = 'testing@gmail.com'

    password = 'password123'

    data = {
        'email': email,
        'password1': password,
        'password2': password,
    }

    res = client.post(f'{BASE_URL}/rest-auth/registration/', data)
    assert res.status_code == status.HTTP_201_CREATED

    key = res.json().get('key')
    res = client.get(url, HTTP_AUTHORIZATION='Token ' + key)
    assert res.status_code == status.HTTP_200_OK


def test_login(client):
    """
    make sure we can login with a user
    """
    email = 'john@doe.org'
    password = 'testing123'
    user = MyUser.objects.create(email=email)
    user.set_password(password)
    user.save()

    data = {
        'email': email,
        'password': password,
    }

    res = client.post(f'{BASE_URL}/rest-auth/login/', data)
    assert res.status_code == status.HTTP_200_OK

    key = res.json().get('key')
    res = client.get(f'{BASE_URL}/rest-auth/user/', HTTP_AUTHORIZATION='Token ' + key)
    assert res.status_code == status.HTTP_200_OK


def test_logout(client):
    """
    make sure a user can logout
    """
    email = 'john@doe.org'
    password = 'testing123'
    user = MyUser.objects.create(email=email)
    user.set_password(password)
    user.save()

    data = {
        'email': email,
        'password': password,
    }

    res = client.post(f'{BASE_URL}/rest-auth/login/', data)
    assert res.status_code == status.HTTP_200_OK

    key = res.json().get('key')
    res = client.post(f'{BASE_URL}/rest-auth/logout/', HTTP_AUTHORIZATION='Token ' + key)
    assert res.status_code == status.HTTP_200_OK

    res = client.get(f'{BASE_URL}/rest-auth/user/', HTTP_AUTHORIZATION='Token ' + key)
    assert res.status_code == status.HTTP_401_UNAUTHORIZED, \
        'logged out user was able to access login required info'


def test_recipe_creation(client, user):
    """
    ensure that the user can create recipes
    """
    client.force_authenticate(user)

    data = {
        'title': 'Recipe title',
        'author': 'Recipe author',
        'source': 'www.exmple.com',
        'time': '1 hour',
        'ingredients': [
            '1 tablespoon black pepper',
            '1 pound salt',
            '1 pound fish',
        ],
        'steps': [
            'place fish in salt',
            'cover with pepper',
            'let rest for 1 year',
        ],
        'tags': [
            'oven',
        ]
    }

    res = client.post(f'{BASE_URL}/recipes/', data)
    assert res.status_code == status.HTTP_201_CREATED

    recipe_id = res.json.get('id')
    res = client.get(f'{BASE_URL}/recipes/{recipe_id}/')
    assert res.status_code == status.HTTP_200_OK
    assert res.json() == data


def test_recipe_deletion(client, user, recipe):
    """
    ensure that the user can delete a recipe
    """
    client.force_authenticate(user)

    res = client.delete(f'{BASE_URL}/recipes/{recipe.id}/')
    assert res.status_code == status.HTTP_204_NO_CONTENT

    res = client.get(f'{BASE_URL}/recipes/{recipe.id}/')
    assert res.status_code == status.HTTP_404_NOT_FOUND


def test_recipe_updating(client, user, recipe):
    """
    ensure a user can update a recipe
    """
    client.force_authenticate(user)

    data = {
        'title': 'A new title',
    }

    assert recipe.title != data.get('title')

    res = client.patch(f'{BASE_URL}/recipes/{recipe.id}/', data)
    assert res.status_code == status.HTTP_200_OK

    assert res.json().get('title') == data.get('title')
