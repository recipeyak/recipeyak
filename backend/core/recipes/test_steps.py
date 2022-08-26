import pytest
from django.db.utils import IntegrityError
from django.urls import reverse
from rest_framework import status

from core.models import Recipe, Step

pytestmark = pytest.mark.django_db


def test_step_position_order(client, user, recipe):
    """
    steps should be returned in order based on position
    """
    client.force_authenticate(user)

    Step.objects.bulk_create(
        [
            Step(text="A new step", position=9.0, recipe=recipe),
            Step(text="Another new step", position=23.0, recipe=recipe),
        ]
    )
    res = client.get(f"/api/v1/recipes/{recipe.id}/")
    assert res.status_code in (status.HTTP_201_CREATED, status.HTTP_200_OK)
    assert res.json()["steps"] == sorted(
        res.json()["steps"], key=lambda x: x["position"]  # type: ignore [no-any-return]
    )


@pytest.mark.parametrize(
    "step", [{"text": "A new step"}, {"text": "Another new step", "position": 23.0}]
)
def test_adding_step_to_recipe(step, client, user, recipe):
    """
    ensure a user can add a step to a recipe
    """
    client.force_authenticate(user)

    res = client.post(f"/api/v1/recipes/{recipe.id}/steps/", step)
    assert res.status_code == status.HTTP_201_CREATED

    res = client.get(f"/api/v1/recipes/{recipe.id}/")
    assert res.status_code == status.HTTP_200_OK

    assert step.get("text") in (
        step.get("text") for step in res.json().get("steps")
    ), "step was not in the steps of the recipe"


def test_position_constraint_with_deleted_steps(recipe: Recipe) -> None:
    """
    We want to keep the constraint requiring position to be unique for the
    recipe but we want to ignore the constraint when the step is soft
    deleted.
    """
    first_step = Step.objects.create(recipe=recipe, position=100, text="alpha")
    second_step = Step.objects.create(recipe=recipe, position=150, text="bravo")
    second_step.delete()

    # shouldn't fail
    first_step.position = second_step.position
    first_step.save()


def test_position_constraint(recipe: Recipe) -> None:
    """
    Ensure that with undeleted steps we enforce the unique constraint on
    (recipe, position).
    """
    Step.objects.create(recipe=recipe, position=100, text="alpha")
    with pytest.raises(IntegrityError):
        Step.objects.create(recipe=recipe, position=100, text="bravo")
