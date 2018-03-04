import pytest

from django.urls import reverse

from .models import Team, Membership, Recipe, Invite

pytestmark = pytest.mark.django_db


def test_team_force_join(client, team, user, user2, user3):
    assert not team.is_member(user2), \
        'User should not be a member'
    team.force_join(user2)
    assert team.is_member(user2), \
        'User should be team member'

    assert not team.is_member(user3), \
        'User should not be a member'
    team.force_join_admin(user3)
    assert team.is_admin(user3), \
        'User should be a team admin'


def test_team_set_public_private(client, team, user, user2):
    assert not team.is_public, \
        'Team should not be public'
    team.set_public()
    assert team.is_public, \
        'Team should be public'

    team.set_private()
    assert not team.is_public, \
        'Team should be private'


def test_team_is_member(client, team, user, user2):
    assert not team.is_member(user2), \
        'User2 should not not be a default team member'
    assert team.is_member(user), \
        'User should be a default team member'

    team.force_join(user2)
    assert team.is_member(user2), \
        'User2 should be a member'
