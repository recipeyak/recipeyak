import pytest
from django.db.utils import IntegrityError

from recipeyak.models import Ingredient, Recipe

pytestmark = pytest.mark.django_db


def test_position_constraint_with_deleted_ingredient(recipe: Recipe) -> None:
    """
    We want to keep the constraint requiring position to be unique for the
    recipe but we want to ignore the constraint when the step is soft
    deleted.
    """
    first_step = Ingredient.objects.create(recipe=recipe, position=100)
    second_step = Ingredient.objects.create(recipe=recipe, position=150)
    second_step.delete()

    # shouldn't fail
    first_step.position = second_step.position
    first_step.save()


@pytest.mark.xfail(reason="we don't support a constrain on this yet in the API.")
def test_position_constraint(recipe: Recipe) -> None:
    """
    Ensure that with undeleted steps we enforce the unique constraint on
    (recipe, position).
    """
    Ingredient.objects.create(recipe=recipe, position=100)
    with pytest.raises(IntegrityError):
        Ingredient.objects.create(recipe=recipe, position=100)
