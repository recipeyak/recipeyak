import pytest

from rest_framework.test import APIClient

from .models import MyUser, Recipe, Ingredient, Step, Tag


@pytest.fixture
def user():
    email = 'john@doe.org'
    password = 'testing123'
    user = MyUser.objects.create(email=email)
    user.set_password(password)
    user.save()
    return user


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def recipe(user):

    title = 'Recipe title'
    author = 'Recipe author'
    source = 'www.exmple.com'
    time = '1 hour'

    recipe = Recipe.objects.create(
        title=title, author=author, source=source, time=time, user=user)

    Ingredient.objects.create(text='1 Egg', recipe=recipe)

    Step.objects.create(
        text='Place egg in boiling water and cook for ten minutes',
        recipe=recipe)

    Tag.objects.create(
        text='stove',
        recipe=recipe)

    return recipe
