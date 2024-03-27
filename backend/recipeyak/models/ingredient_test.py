import pytest
from django.db.utils import IntegrityError
from django.test.client import Client

from recipeyak.models import Ingredient, Recipe
from recipeyak.models.team import Team
from recipeyak.models.user import User

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


def test_recipe_field_trimming(client: Client, user: User, team: Team) -> None:
    """
    Trim excess whitespace
    """
    client.force_login(user)
    user.schedule_team = team
    user.save()
    payload = {
        "name": "   Chocolate Cake   ",
        "team": team.pk,
    }
    res = client.post("/api/v1/recipes/", payload, content_type="application/json")
    assert res.status_code == 200
    assert res.json()["name"] == "Chocolate Cake"

    payload = {
        "name": "   Chocolate Cake   ",
        "author": "  J. Doe    ",
        "time": "  45min   ",
        "tags": ["  my_tag_name  "],
        "servings": "  4 servings  ",
        "source": " example.com ",
        "team": team.pk,
    }
    recipe_id = res.json()["id"]
    res = client.patch(
        f"/api/v1/recipes/{recipe_id}/", payload, content_type="application/json"
    )
    assert res.status_code == 200
    assert res.json()["name"] == "Chocolate Cake"
    assert res.json()["author"] == "J. Doe"
    assert res.json()["time"] == "45min"
    assert res.json()["tags"] == ["my_tag_name"]
    assert res.json()["servings"] == "4 servings"
    assert res.json()["source"] == "example.com"


def test_ingredient_field_trimming(
    client: Client, user: User, team: Team, recipe: Recipe
) -> None:
    """
    Trim excess whitespace
    """
    client.force_login(user)
    user.schedule_team = team
    user.save()
    recipe.team = team
    recipe.save()

    payload = {
        "quantity": "",
        "name": " tomato ",
        "description": " chopped ",
        "position": "$",
        "optional": False,
    }
    res = client.post(
        f"/api/v1/recipes/{recipe.pk}/ingredients/",
        payload,
        content_type="application/json",
    )
    assert res.status_code == 200
    assert res.json()["name"] == "tomato"
    assert res.json()["description"] == "chopped"

    ingredient_id = res.json()["id"]
    res = client.patch(
        f"/api/v1/ingredients/{ingredient_id}/",
        payload,
        content_type="application/json",
    )
    assert res.status_code == 200
    assert res.json()["name"] == "tomato"
    assert res.json()["description"] == "chopped"


def test_step_field_trimming(
    client: Client, user: User, team: Team, recipe: Recipe
) -> None:
    """
    Trim excess whitespace
    """
    client.force_login(user)
    user.schedule_team = team
    user.save()
    recipe.team = team
    recipe.save()

    payload = {
        "text": " some test here  ",
        "position": "$",
    }
    res = client.post(
        f"/api/v1/recipes/{recipe.pk}/steps/", payload, content_type="application/json"
    )
    assert res.status_code == 200
    assert res.json()["text"] == "some test here"

    step_id = res.json()["id"]
    res = client.patch(
        f"/api/v1/steps/{step_id}/",
        payload,
        content_type="application/json",
    )
    assert res.status_code == 200
    assert res.json()["text"] == "some test here"
