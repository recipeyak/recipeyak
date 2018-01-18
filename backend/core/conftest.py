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
def user2():
    email = 'james@smith.org'
    password = 'testing123'
    user = MyUser.objects.create(email=email)
    user.set_password(password)
    user.save()
    return user


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def recipes(user):
    """
    list of empty recipes with different modified times
    note: each item will have a different creation time inherently
    """

    name = 'Recipe name'
    author = 'Recipe author'

    return [Recipe.objects.create(
                name=name,
                author=author,
                user=user)
            for n in range(5)]


@pytest.fixture
def empty_recipe(user):
    name = 'empty recipe'
    return Recipe.objects.create(name=name, user=user)


@pytest.fixture
def recipe(user):

    name = 'Recipe name'
    author = 'Recipe author'
    source = 'www.exmple.com'
    time = '1 hour'

    recipe = Recipe.objects.create(
        name=name, author=author, source=source, time=time, user=user)

    Ingredient.objects.create(
        quantity='1 lbs',
        name='egg',
        description='scrambled',
        recipe=recipe)

    Ingredient.objects.create(
        quantity='2 tbs',
        name='soy sauce',
        recipe=recipe)

    Step.objects.create(
        text='Place egg in boiling water and cook for ten minutes',
        recipe=recipe)

    Tag.objects.create(
        text='stove',
        recipe=recipe)

    return recipe


@pytest.fixture
def recipe_pie(user):
    """
    incomplete pie recipe
    """
    name = 'Brandied Pumpkin Pie'
    author = 'Melissa Clark'
    source = 'https://cooking.nytimes.com/recipes/1015413-brandied-pumpkin-pie'
    time = '4 hours'

    recipe = Recipe.objects.create(
        name=name, author=author, source=source, time=time, user=user)

    Ingredient.objects.create(
        quantity='150 grams',
        name='all-purpose flour',
        recipe=recipe)

    Ingredient.objects.create(
        quantity='0.25 teaspoon',
        name='fine sea salt',
        recipe=recipe)

    Step.objects.create(
        text='Make the crust: In a food processor, pulse together the flour and salt.',
        recipe=recipe)

    Tag.objects.create(
        text='oven',
        recipe=recipe)

    return recipe


@pytest.fixture
def recipe2(user):
    return recipe_pie(user)
