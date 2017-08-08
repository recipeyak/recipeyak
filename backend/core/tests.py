import pytest

from .models import MyUser

pytestmark = pytest.mark.django_db


def test_create_user():
    """
    Ensure that password is hashed and email is set
    """
    email = 'john@doe.org'
    password = 'testing123'
    user = MyUser.objects.create(email=email)
    user.set_password(password)
    user.save()
    assert user.password != password
    assert user.email == email


def test_create_cart_with_new_user(user):
    """
    A cart should be created when a user is created
    """
    assert user.cart is not None


def test_avatar_url(user):
    """
    User's avatar url should not change
    """
    assert user.avatar_url == "//www.gravatar.com/avatar/bc6a715808d9aae0ddeefb1e47e482a6?d=identicon&r=g"
