import pytest

from django.conf import settings
from rest_framework import status
from .models import MyUser
from .serializers import UserSerializer

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

    user = MyUser.objects.first()
    assert res.json().get('user') == UserSerializer(user).data, \
        "response didn't return user data"

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

    assert res.json().get('user') == UserSerializer(user).data, \
        "response didn't return user data"

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


def test_login_in_two_places_and_logout_from_one(client):
    """
    ensure when logged into one place, logging out doesn't result in logging out of both places.

    This test ensure that the added functionality from django-rest-knox works
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

    # 1. log in once
    res = client.post(f'{BASE_URL}/rest-auth/login/', data)
    assert res.status_code == status.HTTP_200_OK

    first_login_key = res.json().get('key')

    assert res.json().get('user') == UserSerializer(user).data

    # 2. log in a second time
    res = client.post(f'{BASE_URL}/rest-auth/login/', data)
    assert res.status_code == status.HTTP_200_OK
    second_login_key = res.json().get('key')

    assert second_login_key != first_login_key

    assert res.json().get('user') == UserSerializer(user).data

    # 3. logout first login session
    res = client.post(f'{BASE_URL}/rest-auth/logout/', HTTP_AUTHORIZATION='Token ' + first_login_key)
    assert res.status_code == status.HTTP_200_OK

    # 4. ensure first login key doesn't work
    res = client.get(f'{BASE_URL}/rest-auth/user/', HTTP_AUTHORIZATION='Token ' + first_login_key)
    assert res.status_code == status.HTTP_401_UNAUTHORIZED

    # 4. ensure second login key still works
    res = client.get(f'{BASE_URL}/rest-auth/user/', HTTP_AUTHORIZATION='Token ' + second_login_key)
    assert res.status_code == status.HTTP_200_OK
