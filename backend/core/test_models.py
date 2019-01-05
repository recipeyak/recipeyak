import pytest

from core.models import Recipe, Step, Ingredient

pytestmark = pytest.mark.django_db


def test_team_force_join(client, team, user, user2, user3, empty_team):
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


def test_team_kick_user(client, team, user, user2):
    """
    Remove member from team. If they have an invite to team, cancel it.
    """
    assert team.is_member(user)
    team.force_join(user2)
    team.kick_user(user)
    assert not team.is_member(user)


def test_team_set_public_private(client, team, user, user2):
    assert not team.is_public, "Team should not be public"
    team.set_public()
    assert team.is_public, "Team should be public"

    team.set_private()
    assert not team.is_public, "Team should be private"


def test_team_is_member(client, team, user, user2):
    assert not team.is_member(user2), "User2 should not not be a default team member"
    assert team.is_member(user), "User should be a default team member"

    team.force_join(user2)
    assert team.is_member(user2), "User2 should be a member"


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

    a = (recipe.steps.values(), recipe.steps.values())
    recipe = recipe.move_to(team)
    b = (recipe.steps.values(), recipe.steps.values())

    for x, y in zip(a, b):
        assert list(x) == list(y)
    assert recipe.owner == team


def test_recipe_copy_to(client, team, user, recipe):
    """
    Copy recipe to team from user or another team
    """
    assert recipe.owner == user

    team_recipe = recipe.copy_to(team)

    assert recipe != team_recipe
    assert team_recipe.owner == team and recipe.owner == user

    for a, b in [
        (recipe.steps.values(), team_recipe.steps.values()),
        (recipe.ingredients.values(), team_recipe.ingredients.values()),
    ]:
        assert len(a) == len(b)
        for x, y in zip(a, b):
            assert x["id"] != y["id"]
            assert x["recipe_id"] != y["recipe_id"]
            # ignore keys that will change
            for key in ["id", "created", "modified", "recipe_id"]:
                x.pop(key)
                y.pop(key)
            assert x == y


@pytest.mark.parametrize("model", [Recipe, Ingredient, Step])
def test_soft_delete(model, recipe: Recipe):
    """
    Verify that soft delete works for provided models
    """
    model_count = model.objects.count()
    assert model_count > 0

    model.objects.all().delete()
    assert model.objects.count() == 0, "deletion hides objects"
    assert (
        model.objects.all_with_deleted().count() == model_count
    ), "objects are not deleted"
    model.objects.deleted_set().undelete()
    assert model.objects.count() == model_count, "restore works"


def test_soft_delete_relations(recipe: Recipe):
    """
    Verify that soft delete cascades across relations
    """
    ingredient_ids = recipe.ingredient_set.all().values_list("id", flat=True)
    step_ids = recipe.step_set.all().values_list("id", flat=True)
    recipe_id = recipe.id

    def objects_exist() -> bool:
        return (
            Recipe.objects.filter(id=recipe_id).exists()
            and Ingredient.objects.filter(id__in=ingredient_ids).exists()
            and Step.objects.filter(id__in=step_ids).exists()
        )

    assert objects_exist(), "recipe, steps, and ignredients should be accessible"
    recipe.delete()

    assert not objects_exist(), "soft deleted objects should be hidden"

    recipe.undelete()

    assert objects_exist(), "we should restore steps, ingredients, and the recipe"
