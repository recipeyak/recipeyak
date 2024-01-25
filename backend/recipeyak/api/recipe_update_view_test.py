import pytest
from django.test.client import Client

from recipeyak.models import ChangeType, Ingredient, Recipe, RecipeChange, Step, User
from recipeyak.models.team import Team

pytestmark = pytest.mark.django_db


@pytest.fixture
def step(recipe: Recipe) -> Step:
    return Step.objects.create(
        text="Garnish with chives and serve.", recipe=recipe, position=15
    )


@pytest.fixture
def ingredient(recipe: Recipe) -> Ingredient:
    return Ingredient.objects.create(
        quantity="1 cup", name="flour", description="sifted", position=15, recipe=recipe
    )


def test_step_create(client: Client, recipe: Recipe, user: User, team: Team) -> None:
    recipe.team = team
    recipe.save()
    assert (
        RecipeChange.objects.count() == 0
    ), "We shouldn't have any changes recorded yet."
    data = {"text": "Combine ingredients and mix well."}
    client.force_login(user)
    res = client.post(
        f"/api/v1/recipes/{recipe.id}/steps/", data, content_type="application/json"
    )
    assert res.status_code == 201
    assert res.json()["text"] == data["text"]

    assert RecipeChange.objects.count() == 1, "We should have our step creation change."
    change: RecipeChange = RecipeChange.objects.get()
    assert change.before == ""
    assert change.after == res.json()["text"]
    assert change.change_type == ChangeType.STEP_CREATE
    assert change.actor == user
    assert change.recipe is not None
    assert change.recipe.id == recipe.id


def test_step_update(
    client: Client, recipe: Recipe, user: User, step: Step, team: Team
) -> None:
    recipe.team = team
    recipe.save()
    assert (
        RecipeChange.objects.count() == 0
    ), "We shouldn't have any changes recorded yet."
    data = {"text": "Combine ingredients and mix well."}
    assert data["text"] != step.text, "Ensure we are changing the step with our update."
    client.force_login(user)
    res = client.patch(
        f"/api/v1/steps/{step.id}/",
        data,
        content_type="application/json",
    )
    assert res.status_code == 200
    assert res.json()["text"] == data["text"]

    assert RecipeChange.objects.count() == 1, "We should have our step update change."
    change: RecipeChange = RecipeChange.objects.get()
    assert change.before == step.text
    assert change.after == res.json()["text"]
    assert change.change_type == ChangeType.STEP_UPDATE
    assert change.actor == user
    assert change.recipe is not None
    assert change.recipe.id == recipe.id


def test_step_delete(
    client: Client, recipe: Recipe, user: User, step: Step, team: Team
) -> None:
    recipe.team = team
    recipe.save()
    assert (
        RecipeChange.objects.count() == 0
    ), "We shouldn't have any changes recorded yet."
    client.force_login(user)
    res = client.delete(f"/api/v1/steps/{step.id}/")
    assert res.status_code == 204

    assert RecipeChange.objects.count() == 1, "We should have our step delete change."
    change: RecipeChange = RecipeChange.objects.get()
    assert change.before == step.text
    assert change.after == ""
    assert change.change_type == ChangeType.STEP_DELETE
    assert change.actor == user
    assert change.recipe is not None
    assert change.recipe.id == recipe.id


def test_recipe_name_update(
    client: Client, recipe: Recipe, user: User, team: Team
) -> None:
    recipe.team = team
    recipe.save()
    assert (
        RecipeChange.objects.count() == 0
    ), "We shouldn't have any changes recorded yet."
    data = {"name": "A different title."}
    assert data["name"] != recipe.name, "Ensure we are changing the title."
    client.force_login(user)
    res = client.patch(
        f"/api/v1/recipes/{recipe.id}/", data, content_type="application/json"
    )
    assert res.status_code == 200
    assert res.json()["name"] == data["name"]

    assert RecipeChange.objects.count() == 1, "We should have our recipe update change."
    change: RecipeChange = RecipeChange.objects.get()
    assert change.before == recipe.name
    assert change.after == res.json()["name"]
    assert change.change_type == ChangeType.NAME
    assert change.actor == user
    assert change.recipe is not None
    assert change.recipe.id == recipe.id


def test_recipe_source_update(
    client: Client, recipe: Recipe, user: User, team: Team
) -> None:
    recipe.team = team
    recipe.save()
    assert (
        RecipeChange.objects.count() == 0
    ), "We shouldn't have any changes recorded yet."
    data = {"source": "A different title."}
    assert data["source"] != recipe.source, "Ensure we are changing the title."
    client.force_login(user)
    res = client.patch(
        f"/api/v1/recipes/{recipe.id}/", data, content_type="application/json"
    )
    assert res.status_code == 200
    assert res.json()["source"] == data["source"]

    assert RecipeChange.objects.count() == 1, "We should have our recipe update change."
    change: RecipeChange = RecipeChange.objects.get()
    assert change.before == recipe.source
    assert change.after == res.json()["source"]
    assert change.change_type == ChangeType.SOURCE
    assert change.actor == user
    assert change.recipe is not None
    assert change.recipe.id == recipe.id


def test_recipe_servings_update(
    client: Client, recipe: Recipe, user: User, team: Team
) -> None:
    recipe.team = team
    recipe.save()
    assert (
        RecipeChange.objects.count() == 0
    ), "We shouldn't have any changes recorded yet."
    data = {"servings": "A different title."}
    assert data["servings"] != recipe.servings, "Ensure we are changing the title."
    client.force_login(user)
    res = client.patch(
        f"/api/v1/recipes/{recipe.id}/", data, content_type="application/json"
    )
    assert res.status_code == 200
    assert res.json()["servings"] == data["servings"]

    assert RecipeChange.objects.count() == 1, "We should have our recipe update change."
    change: RecipeChange = RecipeChange.objects.get()
    assert change.before == (recipe.servings or "")
    assert change.after == res.json()["servings"]
    assert change.change_type == ChangeType.SERVINGS
    assert change.actor == user
    assert change.recipe is not None
    assert change.recipe.id == recipe.id


def test_recipe_time_update(
    client: Client, recipe: Recipe, user: User, team: Team
) -> None:
    recipe.team = team
    recipe.save()
    assert (
        RecipeChange.objects.count() == 0
    ), "We shouldn't have any changes recorded yet."
    data = {"time": "A different title."}
    assert data["time"] != recipe.time, "Ensure we are changing the title."
    client.force_login(user)
    res = client.patch(
        f"/api/v1/recipes/{recipe.id}/", data, content_type="application/json"
    )
    assert res.status_code == 200
    assert res.json()["time"] == data["time"]

    assert RecipeChange.objects.count() == 1, "We should have our recipe update change."
    change: RecipeChange = RecipeChange.objects.get()
    assert change.before == recipe.time
    assert change.after == res.json()["time"]
    assert change.change_type == ChangeType.TIME
    assert change.actor == user
    assert change.recipe is not None
    assert change.recipe.id == recipe.id


def test_ingredient_create(
    client: Client, recipe: Recipe, user: User, team: Team
) -> None:
    recipe.team = team
    recipe.save()
    assert (
        RecipeChange.objects.count() == 0
    ), "We shouldn't have any changes recorded yet."
    ingredient_data = {
        "quantity": "1 tablespoon",
        "name": "black pepper",
        "description": "roughly ground",
    }
    client.force_login(user)
    res = client.post(
        f"/api/v1/recipes/{recipe.id}/ingredients/",
        ingredient_data,
        content_type="application/json",
    )
    assert res.status_code == 201

    assert RecipeChange.objects.count() == 1
    change: RecipeChange = RecipeChange.objects.get()
    assert change.actor == user
    assert change.before == ""
    assert change.after == "1 tablespoon black pepper, roughly ground"
    assert change.change_type == ChangeType.INGREDIENT_CREATE
    assert change.recipe is not None
    assert change.recipe.id == recipe.id


def test_ingredient_update(
    client: Client, recipe: Recipe, user: User, ingredient: Ingredient, team: Team
) -> None:
    recipe.team = team
    recipe.save()
    assert (
        RecipeChange.objects.count() == 0
    ), "We shouldn't have any changes recorded yet."
    ingredient_data = {"quantity": "3 cups", "optional": True}
    client.force_login(user)
    res = client.patch(
        f"/api/v1/ingredients/{ingredient.id}/",
        ingredient_data,
        content_type="application/json",
    )
    assert res.status_code == 200
    assert res.json()["quantity"] == ingredient_data["quantity"]

    assert RecipeChange.objects.count() == 1
    change: RecipeChange = RecipeChange.objects.get()
    assert change.actor == user
    assert change.before == "1 cup flour, sifted"
    assert change.after == "3 cups flour, sifted [optional]"
    assert change.change_type == ChangeType.INGREDIENT_UPDATE
    assert change.recipe is not None
    assert change.recipe.id == recipe.id


def test_ingredient_delete(
    client: Client, recipe: Recipe, user: User, ingredient: Ingredient, team: Team
) -> None:
    recipe.team = team
    recipe.save()
    assert (
        RecipeChange.objects.count() == 0
    ), "We shouldn't have any changes recorded yet."

    client.force_login(user)
    res = client.delete(f"/api/v1/ingredients/{ingredient.id}/")
    assert res.status_code == 204

    assert RecipeChange.objects.count() == 1
    change: RecipeChange = RecipeChange.objects.get()
    assert change.actor == user
    assert change.before == "1 cup flour, sifted"
    assert change.after == ""
    assert change.change_type == ChangeType.INGREDIENT_DELETE
    assert change.recipe is not None
    assert change.recipe.id == recipe.id
