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


def test_combining_recipes_with_improper_quantities(client, user):
    """
    make sure we can combine recipes with units like 'some' and 'sprinkle'
    """

    # 1. create our recipes
    recipe = Recipe.objects.create(
        name='Salmon and Tomatoes in Foil', author='Mark Bittman', user=user)

    name = 'basil leaves'
    count = 16
    Ingredient.objects.create(
        quantity=count,
        name=name,
        recipe=recipe)

    recipe2 = Recipe.objects.create(
        name='Pizza With Sweet and Hot Peppers', author='David Tanis', user=user)

    recipe.cartitem.count = 1
    recipe.cartitem.save()

    recipe2.cartitem.count = 1
    recipe2.cartitem.save()

    # 2. set ingredients of second recipe to 'basic' quantities and assert
    for quantity in ['some', 'sprinkle']:

        Ingredient.objects.filter(recipe=recipe2).delete()

        Ingredient.objects.create(
            quantity=quantity,
            name=name,
            recipe=recipe2)

        client.force_authenticate(user)
        res = client.get(f'{BASE_URL}/shoppinglist/')
        assert res.status_code == status.HTTP_200_OK
        assert res.json() != []

        assert res.json()[0].get('unit') == str(count) + ' + some'
        assert res.json()[0].get('name') == name


def test_combining_ingredients_with_approximations(user):
    """
    ensure that we can combine 'some pepper', '2 teaspoons pepper', 'sprinkle pepper'
    """

    name = 'Recipe name'
    author = 'Recipe author'

    recipe = Recipe.objects.create(
        name=name, author=author, user=user)

    recipe2 = Recipe.objects.create(
        name='Another recipe', author=author, user=user)

    Ingredient.objects.create(
        quantity='1 tablespoon',
        name='black pepper',
        recipe=recipe)
    Ingredient.objects.create(
        quantity='2 tablespoon',
        name='black pepper',
        recipe=recipe)
    Ingredient.objects.create(
        quantity='sprinkle',
        name='black pepper',
        recipe=recipe)

    Ingredient.objects.create(
        quantity='some',
        name='black pepper',
        recipe=recipe2)

    ingredients = list(Ingredient.objects.all())

    actual = combine_ingredients(ingredients)

    expected = [
            {
                'name': 'black pepper',
                'unit': '3 tablespoon + some',
                }
            ]

    assert actual == expected


def test_adding_to_cart_multiple_times_some_ingredient(user, client):
    """
    with an ingredient of quantity sprinkle that we add to the cart multiple
    times shouldn't become sprinklesprinklesprinkle
    """

    name = 'Recipe name'
    author = 'Recipe author'
    for quantity in ['sprinkle', 'some']:

        recipe = Recipe.objects.create(
            name=name, author=author, user=user)

        Ingredient.objects.create(
            quantity=quantity,
            name='black pepper',
            recipe=recipe)

        recipe.cartitem.count = 3
        recipe.cartitem.save()

        client.force_authenticate(user)
        res = client.get(f'{BASE_URL}/shoppinglist/')
        assert res.status_code == status.HTTP_200_OK
        assert res.json()[0].get('unit') == 'some'


def test_combining_ingredient_with_range_quantity(user, client, empty_recipe):
    """
    '4-5 medium button mushrooms' in the cart twice should produce
    '10 medium button mushrooms'
    """
    name = 'medium button mushrooms'
    Ingredient.objects.create(
        quantity='4-5',
        name=name,
        recipe=empty_recipe)

    empty_recipe.cartitem.count = 2
    empty_recipe.cartitem.save()

    client.force_authenticate(user)
    res = client.get(f'{BASE_URL}/shoppinglist/')
    assert res.status_code == status.HTTP_200_OK

    combined_ingredient = res.json()[0]
    assert combined_ingredient.get('name') == name
    assert combined_ingredient.get('unit') == '10'


def test_combining_ingredients_plural_and_singular_tomatoes(user, client, empty_recipe):
    """
    1 large tomato + 2 large tomatoes --> 3 large tomatoes or possibly 3 large tomato
    """
    Ingredient.objects.create(
        quantity='1',
        name='large tomato',
        recipe=empty_recipe)

    Ingredient.objects.create(
        quantity='2',
        name='large tomatoes',
        recipe=empty_recipe)

    empty_recipe.cartitem.count = 1
    empty_recipe.cartitem.save()

    client.force_authenticate(user)
    res = client.get(f'{BASE_URL}/shoppinglist/')
    assert res.status_code == status.HTTP_200_OK

    assert len(res.json()) == 1

    combined_ingredient = res.json()[0]
    assert combined_ingredient.get('unit') == '3'
    assert combined_ingredient.get('name') == 'large tomatoes'


def test_combining_ingredients_plural_and_singular_lemon(user, client, empty_recipe):
    """
    1.5 lemon + 2 lemons --> 3.5 lemons
    """
    Ingredient.objects.create(
        quantity='1/2',
        name='lemon',
        recipe=empty_recipe)

    Ingredient.objects.create(
        quantity='1',
        name='lemon',
        recipe=empty_recipe)

    Ingredient.objects.create(
        quantity='2',
        name='lemons',
        recipe=empty_recipe)

    empty_recipe.cartitem.count = 1
    empty_recipe.cartitem.save()

    client.force_authenticate(user)
    res = client.get(f'{BASE_URL}/shoppinglist/')
    assert res.status_code == status.HTTP_200_OK

    assert len(res.json()) == 1

    combined_ingredient = res.json()[0]
    assert combined_ingredient.get('unit') == '3.5'
    assert combined_ingredient.get('name') == 'lemons'


def test_combining_plural_and_singular_leaves(user, client, empty_recipe):
    """
    1 bay leaf, 4 bay leaves --> 5 bay leaves
    """
    Ingredient.objects.create(
        quantity='1',
        name='bay leaf',
        recipe=empty_recipe)

    Ingredient.objects.create(
        quantity='4',
        name='bay leaves',
        recipe=empty_recipe)

    empty_recipe.cartitem.count = 1
    empty_recipe.cartitem.save()

    client.force_authenticate(user)
    res = client.get(f'{BASE_URL}/shoppinglist/')
    assert res.status_code == status.HTTP_200_OK

    assert len(res.json()) == 1

    combined_ingredient = res.json()[0]
    assert combined_ingredient.get('unit') == '5'
    assert combined_ingredient.get('name') == 'bay leaves'
