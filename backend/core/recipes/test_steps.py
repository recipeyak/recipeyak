import pytest

from django.urls import reverse
from rest_framework import status

from core.models import Step

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
    res = client.get(reverse("recipes-detail", args=[recipe.id]))
    assert res.status_code in (status.HTTP_201_CREATED, status.HTTP_200_OK)
    assert res.json()["steps"] == sorted(
        res.json()["steps"], key=lambda x: x["position"]
    )


@pytest.mark.parametrize(
    "step", [{"text": "A new step"}, {"text": "Another new step", "position": 23.0}]
)
def test_adding_step_to_recipe(step, client, user, recipe):
    """
    ensure a user can add a step to a recipe
    """
    client.force_authenticate(user)

    res = client.post(reverse("recipe-step-list", args=[recipe.id]), step)
    assert res.status_code == status.HTTP_201_CREATED

    res = client.get(reverse("recipes-detail", args=[recipe.id]))
    assert res.status_code == status.HTTP_200_OK

    assert step.get("text") in (
        step.get("text") for step in res.json().get("steps")
    ), "step was not in the steps of the recipe"
