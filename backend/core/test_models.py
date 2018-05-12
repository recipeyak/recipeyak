import pytest

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
    empty_team.invite_user(user3, creator=user)
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
    assert team.is_member(user)
    team.force_join(user2)
    team.kick_user(user)
    assert not team.is_member(user)


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


def test_team_invite_user(client, empty_team, user):
    assert not user.membership_set.filter(team=empty_team).exists()
    empty_team.invite_user(user, creator=user)
    assert user.membership_set.filter(team=empty_team, is_active=False).exists()


def test_user_has_invite(client, empty_team, user):
    """
    Returns whether a user has pending invited to team
    """
    assert not empty_team.is_member(user)
    assert not user.has_invite(empty_team)
    empty_team.invite_user(user, creator=user)
    assert user.has_invite(empty_team)
    empty_team.force_join(user)
    assert not user.has_invite(empty_team)


def test_recipe_move_to(client, team, user, recipe):
    """
    Move recipe to team from user or another team by changing owner.
    """

    assert recipe.owner == user
    step_count = len(recipe.steps.all())
    ingredient_count = len(recipe.ingredients.all())

    recipe = recipe.move_to(team)

    assert recipe.owner == team
    assert len(recipe.steps.all()) == step_count
    assert len(recipe.ingredients.all()) == ingredient_count


def test_recipe_copy_to(client, team, user, recipe):
    """
    Copy recipe to team from user or another team
    """
    assert recipe.owner == user

    team_recipe = recipe.copy_to(team)

    assert recipe != team_recipe
    assert team_recipe.owner == team and recipe.owner == user

    r_steps = recipe.steps.values()
    t_steps = team_recipe.steps.values()
    assert len(r_steps) == len(t_steps)

    for r_step, t_step in zip(r_steps, t_steps):
        assert r_step['id'] != t_step['id']
        # ignore keys that will change
        for key in ['id', 'created', 'modified', 'recipe_id']:
            r_step.pop(key)
            t_step.pop(key)
        assert r_step == t_step

    r_ingredients = list(recipe.ingredients.all())
    t_ingredients = list(team_recipe.ingredients.all())
    assert len(r_ingredients) == len(t_ingredients)

    for r_ingredient, t_ingredient in zip(r_ingredients, t_ingredients):
        assert r_ingredient.pk != t_ingredient.pk
