import pytest

from django.urls import reverse
from django.conf import settings
from rest_framework import status

from .models import Team, Membership

pytestmark = pytest.mark.django_db


def test_creating_team(client, user, user2):
    client.force_authenticate(user)
    data = {
        'name': 'Recipe Yak Team'
    }
    url = reverse('teams-list')
    res = client.post(url, data)
    assert res.status_code == status.HTTP_201_CREATED
    assert res.json().get('name') == data.get('name')

    url = reverse('teams-detail', kwargs={'pk': res.json().get('id')})
    assert client.get(url).status_code == status.HTTP_200_OK, \
        'user can access newly created team'

    client.force_authenticate(user2)
    assert client.get(url).status_code == status.HTTP_404_NOT_FOUND, \
        "user2 cannnot access team since they aren't members"


def test_deleting_team(client, team, user, user2):
    url = reverse('teams-detail', kwargs={'pk': team.id})

    client.force_authenticate(user2)
    res = client.delete(url)
    assert res.status_code == status.HTTP_404_NOT_FOUND

    client.force_authenticate(user)
    res = client.delete(url)
    assert res.status_code == status.HTTP_204_NO_CONTENT

    assert not Team.objects.filter(id=team.id).exists()


def test_updating_team_name(client, team, user, user2):
    client.force_authenticate(user)
    data = {
        'name': 'new Recipe Yak Team'
    }
    url = reverse('teams-detail', kwargs={'pk': team.id})
    res = client.patch(url, data)
    assert res.status_code == status.HTTP_200_OK
    assert res.json().get('name') == data.get('name')

    client.force_authenticate(user2)
    res = client.patch(url, data)
    assert res.status_code == status.HTTP_404_NOT_FOUND


def test_adding_member_to_team(client, team, user, user2):
    """
    Adding members shouldn't be accessable via the api.
    We only want to add users by invite
    """
    for u in (user, user2):
        client.force_authenticate(u)
        url = reverse('team-member-list', kwargs={'team_pk': team.id})
        res = client.post(url, {})
        assert res.status_code == status.HTTP_405_METHOD_NOT_ALLOWED


def test_inviting_member_to_team(client, team, user, user2):
    client.force_authenticate(user)
    url = reverse('team-invites-list', kwargs={'team_pk': team.id})
    res = client.post(url, { 'user': user2.id, 'level': Membership.ADMIN })
    assert res.status_code == status.HTTP_201_CREATED

    url = reverse('team-invites-list', kwargs={'team_pk': team.id})
    res = client.post(url, { 'user': user2.id })
    assert res.status_code == status.HTTP_400_BAD_REQUEST


def test_removing_member_from_team(client, team, membership, user, user2):
    client.force_authenticate(user)
    url = reverse('team-member-detail',
            kwargs={
                'team_pk': team.id,
                'pk': membership.id
            })
    res = client.delete(url)
    assert res.status_code == status.HTTP_204_NO_CONTENT
    assert not Membership.objects.filter(id=membership.id).exists(), \
        "user's team membership is deleted"
    url = reverse('teams-detail', kwargs={'pk': team.id})
    assert client.get(url).status_code == status.HTTP_404_NOT_FOUND, \
        'user should not be able to access team'

def test_fetching_team_recipes(client, team_with_recipes, user, user2):
    url = reverse('team-recipes-list', kwargs={'team_pk': team_with_recipes.id})

    client.force_authenticate(user2)
    res = client.get(url)
    assert res.status_code == status.HTTP_403_FORBIDDEN

    client.force_authenticate(user)
    res = client.get(url)
    assert res.status_code == status.HTTP_200_OK


def test_adding_recipe_to_team(client, team, user, user2):
    recipe_url = reverse('team-recipes-list', kwargs={'team_pk': team.id})
    client.force_authenticate(user)
    res = client.get(recipe_url)
    assert res.status_code == status.HTTP_200_OK
    assert len(res.json()) == 0

    recipe = {
        'name': 'Recipe name',
        'ingredients': [
            {
                'quantity': '1',
                'unit': 'pound',
                'name': 'salt',
                'description': '',
            },
        ],
        'steps': [
            {'text': 'cover with pepper'},
        ],
    }

    res = client.post(recipe_url, recipe)
    assert res.status_code == status.HTTP_201_CREATED
    recipe_id = res.json().get('id')

    url = reverse('team-recipes-detail',
            kwargs={
                'team_pk': team.id,
                'pk': recipe_id
            })

    res = client.get(url)
    assert res.status_code == status.HTTP_200_OK

    client.force_authenticate(user2)

    res = client.get(url)
    assert res.status_code == status.HTTP_403_FORBIDDEN


def test_removing_recipe_from_team(client, team, user):
    assert False


def test_moving_recipe_to_team(client, team, user):
    assert False


def test_copy_recipe_to_team(client, team, user):
    assert False


def test_member_permissions(client, team, user, user2):
    assert False


def test_adding_admins_to_team(client, team, user, user2):
    assert False


def test_removing_admins_from_team(client, team, user, user2):
    assert False


def test_admin_permissions(client, team, user, user2):
    assert False


def test_adding_viewers_to_team(client, team, user, user2):
    assert False


def test_removing_viewers_from_team(client, team, user, user2):
    assert False


def test_viewer_permissions(client, team, user, user2):
    assert False
