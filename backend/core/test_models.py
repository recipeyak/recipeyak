import pytest

from django.urls import reverse

from .models import Team, Membership, Recipe, Invite

pytestmark = pytest.mark.django_db


def test_team_force_join(client, team, user, user2, user3, empty_team):
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

    # if user is already invited, cancel invite and add them to team
    empty_team.invite_user(user3)
    assert user3.has_invite(empty_team)
    assert not empty_team.is_member(user3)
    empty_team.force_join(user3)
    assert empty_team.is_member(user3)
    assert not user3.has_invite(empty_team), \
        'Invite should be removed'

def test_team_kick_user(client, team, user, user2):
    """
    Remove member from team. If they have an invite to team, cancel it.
    """
    assert user.membership_set.get(team=team)
    team.kick_user(user)
    assert not user.membership_set.filter(team=team).exists()


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


def test_team_invite_user(client, team, user):
    assert False


def test_recipe_move_to(client, team, user):
    """
    Move recipe to team from user or another team
    """
    assert False


def test_recipe_copy_to(client, team, user):
    """
    Copy recipe to team from user or another team
    """
    assert False


def test_user_has_invite(client, team, user, user2):
    """
    Returns whether a user has pending invited to team
    """
    assert False
