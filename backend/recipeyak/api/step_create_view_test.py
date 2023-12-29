from __future__ import annotations

from typing import Any

import pytest
from django.db.utils import IntegrityError
from rest_framework.test import APIClient

from recipeyak.models import Recipe, Step, User
from recipeyak.models.team import Team

pytestmark = pytest.mark.django_db


def test_step_position_order(
    client: APIClient, user: User, recipe: Recipe, team: Team
) -> None:
    """
    steps should be returned in order based on position
    """
    client.force_authenticate(user)

    recipe.team = team
    recipe.save()

    Step.objects.bulk_create(
        [
            Step(text="A new step", position=9.0, recipe=recipe),
            Step(text="Another new step", position=23.0, recipe=recipe),
        ]
    )
    res = client.get(f"/api/v1/recipes/{recipe.id}/")
    assert res.status_code in (201, 200)
    assert res.json()["steps"] == sorted(
        res.json()["steps"], key=lambda x: x["position"]
    )


@pytest.mark.parametrize(
    "step", [{"text": "A new step"}, {"text": "Another new step", "position": 23.0}]
)
def test_adding_step_to_recipe(
    step: dict[str, Any], client: APIClient, user: User, recipe: Recipe, team: Team
) -> None:
    """
    ensure a user can add a step to a recipe
    """
    client.force_authenticate(user)
    recipe.team = team
    recipe.save()

    res = client.post(f"/api/v1/recipes/{recipe.id}/steps/", step)
    assert res.status_code == 201

    res = client.get(f"/api/v1/recipes/{recipe.id}/")
    assert res.status_code == 200

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


@pytest.mark.xfail(reason="we don't support a constrain on this yet in the API.")
def test_position_constraint(recipe: Recipe) -> None:
    """
    Ensure that with undeleted steps we enforce the unique constraint on
    (recipe, position).
    """
    Step.objects.create(recipe=recipe, position=100, text="alpha")
    with pytest.raises(IntegrityError):
        Step.objects.create(recipe=recipe, position=100, text="bravo")
