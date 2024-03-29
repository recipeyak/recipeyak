import pytest
from django.test.client import Client

from recipeyak.models import Team, User

pytestmark = pytest.mark.django_db


def test_team_force_join(
    client: Client,
    team: Team,
    user: User,
    user2: User,
    user3: User,
    empty_team: Team,
) -> None:
    assert not team.is_member(user2), "User should not be a member"
    team.force_join(user2)
    assert team.is_member(user2), "User should be team member"

    assert not team.is_member(user3), "User should not be a member"
    team.force_join_admin(user3)
    assert team.is_admin(user3), "User should be a team admin"

    # if user is already invited, cancel invite and add them to team
    empty_team.invite_user(user3, creator=user)
    assert user3.has_invite(empty_team)
    assert not empty_team.is_member(user3)
    empty_team.force_join(user3)
    assert empty_team.is_member(user3)
    assert not user3.has_invite(empty_team), "Invite should be removed"


def test_team_is_member(client: Client, team: Team, user: User, user2: User) -> None:
    assert not team.is_member(user2), "User2 should not not be a default team member"
    assert team.is_member(user), "User should be a default team member"

    team.force_join(user2)
    assert team.is_member(user2), "User2 should be a member"


def test_team_invite_user(client: Client, empty_team: Team, user: User) -> None:
    assert not user.membership_set.filter(team=empty_team).exists()
    empty_team.invite_user(user, creator=user)
    assert user.membership_set.filter(team=empty_team, is_active=False).exists()


def test_user_has_invite(client: Client, empty_team: Team, user: User) -> None:
    """
    Returns whether a user has pending invited to team
    """
    assert not empty_team.is_member(user)
    assert not user.has_invite(empty_team)
    empty_team.invite_user(user, creator=user)
    assert user.has_invite(empty_team)
    empty_team.force_join(user)
    assert not user.has_invite(empty_team)
