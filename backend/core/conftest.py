import pytest

from .models import MyUser


@pytest.fixture
def user():
    email = 'john@doe.org'
    password = 'testing123'
    user = MyUser.objects.create(email=email)
    user.set_password(password)
    user.save()
    return user
