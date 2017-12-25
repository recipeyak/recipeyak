import pytest

from django.conf import settings
from rest_framework import status

from .utils import combine_ingredients
from .models import Recipe, Ingredient

pytestmark = pytest.mark.django_db

BASE_URL = f'/{settings.API_BASE_URL}'


def test_combining_ingredients(user):

    name = 'Recipe name'
    author = 'Recipe author'
    source = 'www.exmple.com'
    time = '1 hour'

    recipe = Recipe.objects.create(
        name=name, author=author, source=source, time=time, user=user)

    Ingredient.objects.create(
        quantity='2 lbs',
        name='tomato',
        recipe=recipe)

    Ingredient.objects.create(
        quantity='2 tbs',
        name='soy sauce',
        recipe=recipe)

    Ingredient.objects.create(
        quantity='1 kg',
        name='tomato',
        recipe=recipe)

    ingredients = list(Ingredient.objects.all())

    actual = sorted(combine_ingredients(ingredients), key=lambda x: x.get('name'))

    expected = sorted(
        [
            {
                'name': 'tomato',
                'unit': '4.204622621848776 pound',
            },
            {
                'name': 'soy sauce',
                'unit': '2 tablespoon',
            }
        ], key=lambda x: x.get('name'))

    assert actual == expected


def test_fetching_shoppinglist(client, user, recipe):

    client.force_authenticate(user)

    shoppinglist_url = f'{BASE_URL}/shoppinglist/'
    res = client.get(shoppinglist_url)
    assert res.status_code == status.HTTP_200_OK
    assert res.json() == []

    recipe.cartitem.count = 2
    recipe.cartitem.save()

    res = client.get(shoppinglist_url)
    assert res.status_code == status.HTTP_200_OK
    assert res.json() != []

    expected = [{
        'unit': '2 pound',
        'name': 'egg'
        }, {
        'unit': '4 tablespoon',
        'name': 'soy sauce'
        }
    ]

    assert res.json() == expected


def test_combining_ingredients_with_out_units(user):
    """
    ensure that we can combine things like 1 garlic clove
    """

    name = 'Recipe name'
    author = 'Recipe author'

    recipe = Recipe.objects.create(
        name=name, author=author, user=user)

    recipe2 = Recipe.objects.create(
        name='Another recipe', author=author, user=user)

    Ingredient.objects.create(
        quantity='1',
        name='garlic clove',
        recipe=recipe)

    Ingredient.objects.create(
        quantity='8',
        name='garlic clove',
        recipe=recipe2)

    ingredients = list(Ingredient.objects.all())

    actual = sorted(combine_ingredients(ingredients), key=lambda x: x.get('name'))

    expected = sorted(
        [
            {
                'name': 'garlic clove',
                'unit': '9',
            }
        ], key=lambda x: x.get('name'))

    assert actual == expected


def test_combining_ingredients_with_dashes_in_name(user):
    """
    ensure that we can combine names with dashes
    """

    name = 'Recipe name'
    author = 'Recipe author'

    recipe = Recipe.objects.create(
        name=name, author=author, user=user)

    recipe2 = Recipe.objects.create(
        name='Another recipe', author=author, user=user)

    Ingredient.objects.create(
        quantity='1 tablespoon',
        name='extra-virgin olive oil',
        recipe=recipe)

    Ingredient.objects.create(
        quantity='8 tablespoons',
        name='extra virgin olive oil',
        recipe=recipe2)

    ingredients = list(Ingredient.objects.all())

    actual = combine_ingredients(ingredients)

    expected = [
            {
                'name': 'extra virgin olive oil',
                'unit': '9 tablespoon',
                }
            ]

    assert actual == expected
