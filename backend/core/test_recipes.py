from typing import Dict, List, Any
import pytest

from django.urls import reverse
from django.conf import settings
from rest_framework import status

from .models import (
    Recipe,
    Membership,
    Team,
)

pytestmark = pytest.mark.django_db

BASE_URL = f'/{settings.API_BASE_URL}'


def test_recipe_creation(client, user):
    """
    ensure that the user can create recipes
    """
    client.force_authenticate(user)

    data: Dict[str, Any] = {
        'name': 'Recipe name',
        'author': 'Recipe author',
        'source': 'www.exmple.com',
        'servings': '4-6 servings',
        'time': '1 hour',
        'ingredients': [
            {
                'quantity': '1',
                'unit': 'tablespoon',
                'name': 'black pepper',
                'description': '',
            },
            {
                'quantity': '1',
                'unit': 'pound',
                'name': 'salt',
                'description': '',
            },
            {
                'quantity': '1',
                'unit': 'pound',
                'name': 'fish',
                'description': '',
            },
        ],
        'steps': [
            {'text': 'place fish in salt'},
            {'text': 'cover with pepper'},
            {'text': 'let rest for 1 year'},
        ],
    }

    res = client.post(f'{BASE_URL}/recipes/', data)
    assert res.status_code == status.HTTP_201_CREATED

    recipe_id = res.json().get('id')
    res = client.get(f'{BASE_URL}/recipes/{recipe_id}/')
    assert res.status_code == status.HTTP_200_OK

    for key in ['name', 'author', 'source', 'time', 'servings']:
        assert data.get(key) == res.json().get(key)

    # compare the nested items and ignore the ids as they don't exist them in the
    # initial data
    items: List[Dict[str, str]] = data.get('steps')
    new_items: List[Dict[str, str]] = res.json().get('steps')
    for item, new_item in zip(items, new_items):
        assert item.get('text') == new_item.get('text')


def test_creating_recipe_with_empty_ingredients_and_steps(client, user):
    """
    ensure that when creating a recipe without ingredients or steps, that the api will through an error
    """

    client.force_authenticate(user)

    data = {
        'name': '',
        'ingredients': [],
        'steps': [],
    }

    res = client.post(f'{BASE_URL}/recipes/', data)
    assert res.status_code == status.HTTP_400_BAD_REQUEST
    assert res.data.get('name') is not None
    assert res.data.get('ingredients') is not None
    assert res.data.get('steps') is not None


def test_recipe_creation_for_a_team(client, team, user):
    """
    ensure that the user can create recipe for a team
    """

    assert team.is_member(user)

    client.force_authenticate(user)

    data = {
        'name': 'Recipe name',
        'ingredients': [
            {
                'quantity': '1',
                'unit': 'tablespoon',
                'name': 'black pepper',
                'description': '',
            },
        ],
        'steps': [
            {'text': 'place fish in salt'},
        ],
        'team': team.id
    }

    url = reverse('recipes-list')

    res = client.post(url, data)
    assert res.status_code == status.HTTP_201_CREATED

    recipe_id = res.json().get('id')

    assert isinstance(Recipe.objects.get(id=recipe_id).owner, Team)

    url = reverse('recipes-detail', kwargs={'pk': recipe_id})
    assert client.get(url).status_code == status.HTTP_200_OK

    assert Team.objects.get(id=team.id).recipes.first().id == recipe_id


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
        'name': 'A new name',
    }

    assert recipe.name != data.get('name')

    res = client.patch(f'{BASE_URL}/recipes/{recipe.id}/', data)
    assert res.status_code == status.HTTP_200_OK

    assert res.json().get('name') == data.get('name')


def test_updating_step_of_recipe(client, user, recipe):
    """
    ensure a user can update an step of a recipe
    """
    client.force_authenticate(user)

    step = recipe.steps[0]

    step_data = {
        'text': 'An updated step',
        'position': step.position + 10.0
    }

    res = client.patch(f'{BASE_URL}/recipes/{recipe.id}/steps/{step.id}/', step_data)
    assert res.status_code == status.HTTP_200_OK

    res = client.get(f'{BASE_URL}/recipes/{recipe.id}/steps/{step.id}/')
    assert res.status_code == status.HTTP_200_OK

    assert res.json().get('id') is not None

    for key in step_data.keys():
        assert res.json().get(key) == step_data.get(key)


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
        'quantity': '1',
        'unit': 'tablespoon',
        'name': 'black pepper',
        'description': '',
    }

    res = client.post(f'{BASE_URL}/recipes/{recipe.id}/ingredients/', ingredient)
    assert res.status_code == status.HTTP_201_CREATED

    res = client.get(f'{BASE_URL}/recipes/{recipe.id}/')
    assert res.status_code == status.HTTP_200_OK

    assert ingredient.get('name') in (ingredient.get('name') for ingredient in res.json().get('ingredients')), \
        'ingredient was not in the ingredients of the recipe'


def test_updating_ingredient_of_recipe(client, user, recipe):
    """
    ensure a user can update an ingredient of a recipe
    """
    client.force_authenticate(user)

    ingredient_id = recipe.ingredients[0].id

    ingredient = {
        'name': 'black pepper',
    }

    res = client.patch(f'{BASE_URL}/recipes/{recipe.id}/ingredients/{ingredient_id}/', ingredient)
    assert res.status_code == status.HTTP_200_OK

    res = client.get(f'{BASE_URL}/recipes/{recipe.id}/ingredients/{ingredient_id}/')
    assert res.status_code == status.HTTP_200_OK

    assert res.json().get('name') == ingredient.get('name'), "ingredient didn't update"


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


def test_filtering_recipes_by_recent(client, user, recipes):
    """
    make sure we can filter recipes by last modified and limit them by a
    certain amount for /homepage recent recipes
    """

    client.force_authenticate(user)

    res = client.get(f'{BASE_URL}/recipes/?recent')
    assert res.status_code == status.HTTP_200_OK

    recipes_reversed = recipes[::-1]
    expected_first_recipe = recipes_reversed[0].id
    actual_first_recipe = res.json()[0].get('id')

    assert expected_first_recipe == actual_first_recipe, \
        "recipes weren't sorted by the backend"


def test_display_all_accessable_recipes(client, user, recipes, team_with_recipes_no_members):
    """
    User should be able to list all teams they have access to:
        - User-owned recipes
        - Team-owned recipes
    Ensure user can only view team recipes if they have joined.
    """

    client.force_authenticate(user)
    team_with_recipes_no_members.invite_user(user, creator=user)
    res = client.get(reverse('recipes-list'))
    assert res.status_code == status.HTTP_200_OK
    assert len(res.json()) == len(user.recipes.all())

    team_with_recipes_no_members.force_join(user)
    res = client.get(reverse('recipes-list'))
    assert res.status_code == status.HTTP_200_OK
    assert len(res.json()) == len(user.recipes.all()) + len(team_with_recipes_no_members.recipes.all())


def test_recording_edits_for_recipes(client, user, recipe):
    """
    ensure edits being recorded for recipes
    """
    client.force_authenticate(user)

    assert recipe.edits == 0

    recipe.name = 'A different name'
    recipe.save()

    assert recipe.edits == 1


def test_updating_edit_recipe_via_api(client, user, recipe):
    """
    ensure edits occur when updating the recipe via the api
    """
    client.force_authenticate(user)

    res = client.patch(f'{BASE_URL}/recipes/{recipe.id}/', {'name': 'A new name'})
    assert res.status_code == status.HTTP_200_OK

    assert Recipe.objects.get(pk=recipe.id).edits == 1


def test_copy_recipe(client, user_with_recipes, empty_team, user3):
    """
    Users can copy recipe to team if they have write access.
    """
    recipe = user_with_recipes.recipes.first()
    url = reverse('recipes-copy', kwargs={'pk': recipe.id})

    # user must own recipe to copy it
    client.force_authenticate(user3)
    assert recipe.owner != user3
    assert client.post(url, {
        'id': empty_team.id,
        'type': 'team',
        'name': empty_team.name,
    }).status_code == status.HTTP_404_NOT_FOUND

    # team viewer cannot add recipe to team
    client.force_authenticate(user_with_recipes)
    empty_team.force_join(user_with_recipes, level=Membership.READ_ONLY)
    assert recipe.owner == user_with_recipes
    assert client.post(url, {'id': empty_team.id, 'type': 'team'}).status_code == status.HTTP_403_FORBIDDEN

    # contributors and admins can add recipe to team
    empty_team.force_join(user_with_recipes, level=Membership.CONTRIBUTOR)
    res = client.post(url, {'id': empty_team.id, 'type': 'team'})
    assert res.status_code == status.HTTP_200_OK
    assert res.json()['id'] != recipe.id
    assert res.json()['owner'] == {
        'id': empty_team.id,
        'type': 'team',
        'name': empty_team.name,
    }


def test_move_recipe(client, user_with_recipes, empty_team, user3):
    """
    Users can move recipe to team if they have write access.
    """
    recipe = user_with_recipes.recipes.first()
    url = reverse('recipes-move', kwargs={'pk': recipe.id})

    # user must own recipe to copy it
    client.force_authenticate(user3)
    assert recipe.owner != user3
    assert client.post(url, {'id': empty_team.id, 'type': 'team'}).status_code == status.HTTP_404_NOT_FOUND

    # team viewer cannot add recipe to team
    client.force_authenticate(user_with_recipes)
    empty_team.force_join(user_with_recipes, level=Membership.READ_ONLY)
    res = client.post(url, {'id': empty_team.id, 'type': 'team'})
    assert res.status_code == status.HTTP_403_FORBIDDEN

    # members can add recipe to team
    empty_team.force_join(user_with_recipes, level=Membership.CONTRIBUTOR)
    res = client.post(url, {'id': empty_team.id, 'type': 'team'})
    assert res.status_code == status.HTTP_200_OK
    assert res.json()['id'] == recipe.id
    assert res.json()['owner'] == {
        'id': empty_team.id,
        'type': 'team',
        'name': empty_team.name,
    }


def test_recipe_soft_delete(client, recipe, user):
    client.force_authenticate(user)

    res = client.get(reverse('recipes-detail', kwargs={'pk': recipe.id}))
    assert res.status_code == status.HTTP_200_OK

    recipe.delete()

    res = client.get(reverse('recipes-detail', kwargs={'pk': recipe.id}))
    assert res.status_code == status.HTTP_404_NOT_FOUND
