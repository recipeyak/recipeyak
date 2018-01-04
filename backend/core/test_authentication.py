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
    import ipdb; ipdb.set_trace()

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
