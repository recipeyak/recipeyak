from datetime import date

import pytest
from django.test.client import Client

from recipeyak.models import Recipe, ScheduledRecipe, Team, User

pytestmark = pytest.mark.django_db


def test_get_recipe_timeline(
    user: User, user2: User, client: Client, recipe: Recipe, empty_team: Team
) -> None:
    """
    Ensure our timeline endpoint returns the correct data shape. We could
    just serialize this every time in the recipe serialize but the size is will
    continue to grow and will require pagination so breaking it out into its
    own endpoint is eaiser.
    """

    assert recipe.owner == user

    url = f"/api/v1/recipes/{recipe.id}/timeline"
    res = client.get(url)
    assert res.status_code == 403, "Endpoint requires auth."

    client.force_login(user)

    res = client.get("/api/v1/recipes/does_not_exist/timeline")
    assert res.status_code == 404

    res = client.get(url)
    assert (
        ScheduledRecipe.objects.filter(recipe=recipe).exists() is False
    ), "We should start off without ScheduledRecipes"
    assert res.status_code == 200
    assert (
        not res.json()
    ), "Should have an empty array since we haven't scheduled a recipe yet."

    user.schedule_team = empty_team
    user.save()
    scheduled = recipe.schedule(on=date(1776, 1, 1), user=user, team=empty_team)

    res = client.get(url)
    assert res.status_code == 200

    # check response shape

    assert len(res.json()) == 1

    assert res.json()[0]["id"] == scheduled.id
    assert res.json()[0]["on"] == str(scheduled.on)


def test_get_recipe_timeline_ordering(
    user: User, client: Client, recipe: Recipe, team: Team
) -> None:
    """
    ensure we return the timeline items in the correct ordering
    """

    for time in [date(1776, 1, 1), date(1776, 2, 1), date(1776, 3, 1)]:
        recipe.schedule(on=time, user=user, team=team)

    user.schedule_team = team
    user.save()

    url = f"/api/v1/recipes/{recipe.id}/timeline"
    client.force_login(user)
    res = client.get(url)
    assert res.status_code == 200

    assert [scheduled["on"] for scheduled in res.json()] == [
        "1776-03-01",
        "1776-02-01",
        "1776-01-01",
    ]
