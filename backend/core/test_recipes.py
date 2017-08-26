import pytest

from django.conf import settings
from rest_framework import status

pytestmark = pytest.mark.django_db

BASE_URL = f'/{settings.API_BASE_URL}'


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
            {'text': '1 tablespoon black pepper'},
            {'text': '1 pound salt'},
            {'text': '1 pound fish'},
        ],
        'steps': [
            {'text': 'place fish in salt'},
            {'text': 'cover with pepper'},
            {'text': 'let rest for 1 year'},
        ],
        'tags': [
            {'text': 'oven'},
        ]
    }

    res = client.post(f'{BASE_URL}/recipes/', data)
    assert res.status_code == status.HTTP_201_CREATED

    recipe_id = res.json().get('id')
    res = client.get(f'{BASE_URL}/recipes/{recipe_id}/')
    assert res.status_code == status.HTTP_200_OK

    for key in ['title', 'author', 'source']:
        assert data.get(key) == res.json().get(key)

    # compare the nested items and ingore the ids as they don't exist them in the
    # initial data
    for key in ['ingredients', 'steps', 'tags']:
        items = data.get(key)
        new_items = res.json().get(key)
        for item, new_item in zip(items, new_items):
            assert item.get('text') == new_item.get('text')


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


def test_adding_step_to_recipe(client, user, recipe):
    """
    ensure a user can add a step to a recipe
    """
    client.force_authenticate(user)

    step = {
        'text': 'A new step',
    }

    res = client.post(f'{BASE_URL}/recipes/{recipe.id}/steps/', step)
    assert res.status_code == status.HTTP_201_CREATED

    res = client.get(f'{BASE_URL}/recipes/{recipe.id}/')
    assert res.status_code == status.HTTP_200_OK

    assert step.get('text') in (step.get('text') for step in res.json().get('steps')), \
        'step was not in the steps of the recipe'


def test_updating_step_of_recipe(client, user, recipe):
    """
    ensure a user can update an step of a recipe
    """
    client.force_authenticate(user)

    step_id = recipe.steps[0].id

    assert isinstance(step_id, int)

    step = {
        'text': 'An updated step',
    }

    res = client.patch(f'{BASE_URL}/recipes/{recipe.id}/steps/{step_id}/', step)
    assert res.status_code == status.HTTP_200_OK

    res = client.get(f'{BASE_URL}/recipes/{recipe.id}/steps/{step_id}/')
    assert res.status_code == status.HTTP_200_OK

    assert res.json().get('id') is not None

    assert res.json().get('text') == step.get('text'), "step didn't update"


def test_deleting_step_from_recipe(client, user, recipe):
    """
    ensure a user can remove a step from a recipe
    """
    client.force_authenticate(user)

    step_id = recipe.steps[0].id

    assert isinstance(step_id, int)

    res = client.delete(f'{BASE_URL}/recipes/{recipe.id}/steps/{step_id}/')
    assert res.status_code == status.HTTP_204_NO_CONTENT

    res = client.get(f'{BASE_URL}/recipes/{recipe.id}/steps/{step_id}/')
    assert res.status_code == status.HTTP_404_NOT_FOUND

    res = client.get(f'{BASE_URL}/recipes/{recipe.id}/')
    assert res.status_code == status.HTTP_200_OK

    assert step_id not in (step.get('id') for step in res.json().get('steps')), \
        'step was still in the recipe after being deleted'


def test_adding_ingredient_to_recipe(client, user, recipe):
    """
    ensure a user can add a ingredient to a recipe
    """
    client.force_authenticate(user)

    ingredient = {
        'text': 'A new ingredient',
    }

    res = client.post(f'{BASE_URL}/recipes/{recipe.id}/ingredients/', ingredient)
    assert res.status_code == status.HTTP_201_CREATED

    res = client.get(f'{BASE_URL}/recipes/{recipe.id}/')
    assert res.status_code == status.HTTP_200_OK

    assert ingredient.get('text') in (ingredient.get('text') for ingredient in res.json().get('ingredients')), \
        'ingredient was not in the ingredients of the recipe'


def test_updating_ingredient_of_recipe(client, user, recipe):
    """
    ensure a user can update an ingredient of a recipe
    """
    client.force_authenticate(user)

    ingredient_id = recipe.ingredients[0].id

    ingredient = {
        'text': 'An updated ingredient',
    }

    res = client.patch(f'{BASE_URL}/recipes/{recipe.id}/ingredients/{ingredient_id}/', ingredient)
    assert res.status_code == status.HTTP_200_OK

    res = client.get(f'{BASE_URL}/recipes/{recipe.id}/ingredients/{ingredient_id}/')
    assert res.status_code == status.HTTP_200_OK

    assert res.json().get('text') == ingredient.get('text'), "ingredient didn't update"


def test_deleting_ingredient_from_recipe(client, user, recipe):
    """
    ensure a user can remove a ingredient from a recipe
    """
    client.force_authenticate(user)

    ingredient_id = recipe.ingredients[0].id

    res = client.delete(f'{BASE_URL}/recipes/{recipe.id}/ingredients/{ingredient_id}/')
    assert res.status_code == status.HTTP_204_NO_CONTENT

    res = client.get(f'{BASE_URL}/recipes/{recipe.id}/ingredients/{ingredient_id}/')
    assert res.status_code == status.HTTP_404_NOT_FOUND

    res = client.get(f'{BASE_URL}/recipes/{recipe.id}/')
    assert res.status_code == status.HTTP_200_OK

    assert ingredient_id not in (ingredient.get('id') for ingredient in res.json().get('ingredients')), \
        'ingredient was still in the recipe after being deleted'


def test_adding_tag_to_recipe(client, user, recipe):
    """
    ensure a user can add a tag to a recipe
    """
    client.force_authenticate(user)

    tag = {
        'text': 'A new tag',
    }

    res = client.post(f'{BASE_URL}/recipes/{recipe.id}/tags/', tag)
    assert res.status_code == status.HTTP_201_CREATED

    res = client.get(f'{BASE_URL}/recipes/{recipe.id}/')
    assert res.status_code == status.HTTP_200_OK

    assert tag.get('text') in (tag.get('text') for tag in res.json().get('tags')), \
        'tag was not in the tags of the recipe'


def test_updating_tag_of_recipe(client, user, recipe):
    """
    ensure a user can update an tag of a recipe
    """
    client.force_authenticate(user)

    tag_id = recipe.tags[0].id

    tag = {
        'text': 'An updated tag',
    }

    res = client.patch(f'{BASE_URL}/recipes/{recipe.id}/tags/{tag_id}/', tag)
    assert res.status_code == status.HTTP_200_OK

    res = client.get(f'{BASE_URL}/recipes/{recipe.id}/tags/{tag_id}/')
    assert res.status_code == status.HTTP_200_OK

    assert res.json().get('text') == tag.get('text'), "tag didn't update"


def test_deleting_tag_from_recipe(client, user, recipe):
    """
    ensure a user can remove a tag from a recipe
    """
    client.force_authenticate(user)

    tag_id = recipe.tags[0].id

    res = client.delete(f'{BASE_URL}/recipes/{recipe.id}/tags/{tag_id}/')
    assert res.status_code == status.HTTP_204_NO_CONTENT

    res = client.get(f'{BASE_URL}/recipes/{recipe.id}/tags/{tag_id}/')
    assert res.status_code == status.HTTP_404_NOT_FOUND

    res = client.get(f'{BASE_URL}/recipes/{recipe.id}/')
    assert res.status_code == status.HTTP_200_OK

    assert tag_id not in (tag.get('id') for tag in res.json().get('tags')), \
        'tag was still in the recipe after being deleted'
