import pytest

from logging import getLogger

from rest_framework.test import APIClient

from datetime import date

from .models import (
    MyUser,
    Recipe,
    Ingredient,
    Step,
    Tag,
    Team,
    ScheduledRecipe,
)

getLogger('flake8').propagate = False


@pytest.fixture
def user():
    """
    Connected to `team`. Has 5 recipes. Member of `team`.
    """
    email = 'john@doe.org'
    return MyUser.objects.create_user(email=email)


@pytest.fixture
def user_with_recipes(recipes):
    first_recipe, *_ = recipes
    return first_recipe.owner


@pytest.fixture
def user2():
    email = 'james@smith.org'
    return MyUser.objects.create_user(email=email)


@pytest.fixture
def user3():
    email = 'john.doe@example.org'
    return MyUser.objects.create_user(email=email)


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def recipes(user):
    """
    list of empty recipes with different modified times owned by `user`
    note: each item will have a different creation time inherently
    """

    name = 'Recipe name'
    author = 'Recipe author'

    return [Recipe.objects.create(
        name=name,
        author=author,
        owner=user)
        for n in range(5)]


@pytest.fixture
def empty_recipe(user):
    """
    Empty recipe owned by `user`
    """
    name = 'empty recipe'
    return Recipe.objects.create(name=name, owner=user)


@pytest.fixture
def recipe(user):
    """
    Recipe with metadata, Ingredient, Step, and Tag owned by `user`
    """

    name = 'Recipe name'
    author = 'Recipe author'
    source = 'www.exmple.com'
    time = '1 hour'

    recipe = Recipe.objects.create(
        name=name, author=author, source=source, time=time, owner=user)

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
    Recipe with metadata, Ingredient, Step, and Tag owned by `user`.
    Contains the word "pie" in name and source.
    """
    name = 'Brandied Pumpkin Pie'
    author = 'Melissa Clark'
    source = 'https://cooking.nytimes.com/recipes/1015413-brandied-pumpkin-pie'
    time = '4 hours'

    recipe = Recipe.objects.create(
        name=name, author=author, source=source, time=time, owner=user)

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
    """
    Pie recipe owned by `user`
    """
    return recipe_pie(user)


@pytest.fixture
def team(user):
    team = Team.objects.create(name='Recipe Yak Team')
    team.force_join_admin(user=user)
    return team


@pytest.fixture
def empty_team():
    return Team.objects.create(name='The Hateful Eight')


@pytest.fixture
def team_with_recipes(team, recipe, recipe_pie):
    team.recipes.add(recipe)
    team.recipes.add(recipe_pie)
    return team


@pytest.fixture
def team_with_recipes_no_members(recipe, recipe_pie):
    t = Team.objects.create(name='A Team with No Name')
    t.recipes.add(recipe)
    t.recipes.add(recipe_pie)
    return t


@pytest.fixture
def scheduled_recipe(recipe, user):
    return ScheduledRecipe.objects.create(
        recipe=recipe,
        user=user,
        on=date(1976, 7, 6),
        count=1)
