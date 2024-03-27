import pytest
from django.test.client import Client

from recipeyak.fixtures import create_recipe, create_team, create_user
from recipeyak.models.recipe_historical import RecipeHistorical

pytestmark = pytest.mark.django_db


def test_create_recipe_saves_version() -> None:
    client = Client()
    user = create_user()
    team = create_team(user=user)
    client.force_login(user)

    res = client.post(
        "/api/v1/recipes/",
        {
            "team": team.id,
            "name": "Recipe name",
        },
        content_type="application/json",
    )
    assert res.status_code == 200
    assert RecipeHistorical.objects.filter(recipe=res.json()["id"]).exists()


def test_recipe_update_saves_version() -> None:
    client = Client()
    user = create_user()
    team = create_team(user=user)
    recipe = create_recipe(team=team, user=user)
    client.force_login(user)

    before = RecipeHistorical.objects.filter(recipe_id=recipe.id).count()

    res = client.patch(
        f"/api/v1/recipes/{recipe.id}/",
        {"servings": "a metric ton of cookies"},
        content_type="application/json",
    )

    assert res.status_code == 200
    assert RecipeHistorical.objects.filter(recipe_id=recipe.id).count() == before + 1


def test_section_create_saves_version() -> None:
    client = Client()
    user = create_user()
    team = create_team(user=user)
    recipe = create_recipe(team=team, user=user)
    client.force_login(user)

    before = RecipeHistorical.objects.filter(recipe_id=recipe.id).count()

    res = client.post(
        f"/api/v1/recipes/{recipe.id}/sections",
        {"title": "Section title"},
        content_type="application/json",
    )

    assert res.status_code == 200
    assert RecipeHistorical.objects.filter(recipe_id=recipe.id).count() == before + 1


def test_section_update_saves_version() -> None:
    client = Client()
    user = create_user()
    team = create_team(user=user)
    recipe = create_recipe(team=team, user=user)
    section = recipe.section_set.all()[:1].get()
    client.force_login(user)

    before = RecipeHistorical.objects.filter(recipe_id=recipe.id).count()

    res = client.patch(
        f"/api/v1/sections/{section.id}/",
        {"title": "Updated section title"},
        content_type="application/json",
    )

    assert res.status_code == 200
    assert RecipeHistorical.objects.filter(recipe_id=recipe.id).count() == before + 1


def test_section_delete_saves_version() -> None:
    client = Client()
    user = create_user()
    team = create_team(user=user)
    recipe = create_recipe(team=team, user=user)
    section = recipe.section_set.all()[:1].get()
    client.force_login(user)

    before = RecipeHistorical.objects.filter(recipe_id=recipe.id).count()

    res = client.delete(f"/api/v1/sections/{section.id}/")

    assert res.status_code == 204
    assert RecipeHistorical.objects.filter(recipe_id=recipe.id).count() == before + 1


def test_step_create_saves_version() -> None:
    client = Client()
    user = create_user()
    team = create_team(user=user)
    recipe = create_recipe(team=team, user=user)
    client.force_login(user)

    before = RecipeHistorical.objects.filter(recipe_id=recipe.id).count()

    res = client.post(
        f"/api/v1/recipes/{recipe.id}/steps/",
        {"text": "Step text", "position": "a"},
        content_type="application/json",
    )

    assert res.status_code == 200
    assert RecipeHistorical.objects.filter(recipe_id=recipe.id).count() == before + 1


def test_step_update_saves_version() -> None:
    client = Client()
    user = create_user()
    team = create_team(user=user)
    recipe = create_recipe(team=team, user=user)
    step = recipe.step_set.all()[:1].get()
    client.force_login(user)

    before = RecipeHistorical.objects.filter(recipe_id=recipe.id).count()

    res = client.patch(
        f"/api/v1/steps/{step.id}/",
        {"text": "Updated step text"},
        content_type="application/json",
    )

    assert res.status_code == 200
    assert RecipeHistorical.objects.filter(recipe_id=recipe.id).count() == before + 1


def test_step_delete_saves_version() -> None:
    client = Client()
    user = create_user()
    team = create_team(user=user)
    recipe = create_recipe(team=team, user=user)
    step = recipe.step_set.all()[:1].get()
    client.force_login(user)

    before = RecipeHistorical.objects.filter(recipe_id=recipe.id).count()

    res = client.delete(f"/api/v1/steps/{step.id}/")

    assert res.status_code == 204
    assert RecipeHistorical.objects.filter(recipe_id=recipe.id).count() == before + 1


def test_ingredient_create_saves_version() -> None:
    client = Client()
    user = create_user()
    team = create_team(user=user)
    recipe = create_recipe(team=team, user=user)
    client.force_login(user)

    before = RecipeHistorical.objects.filter(recipe_id=recipe.id).count()

    res = client.post(
        f"/api/v1/recipes/{recipe.id}/ingredients/",
        {
            "quantity": "1 cup",
            "name": "cilantro",
            "description": "chopped",
            "position": "abc",
        },
        content_type="application/json",
    )

    assert res.status_code == 200
    assert RecipeHistorical.objects.filter(recipe_id=recipe.id).count() == before + 1


def test_ingredient_update_saves_version() -> None:
    client = Client()
    user = create_user()
    team = create_team(user=user)
    recipe = create_recipe(team=team, user=user)
    ingredient = recipe.ingredient_set.all()[:1].get()
    client.force_login(user)

    before = RecipeHistorical.objects.filter(recipe_id=recipe.id).count()

    res = client.patch(
        f"/api/v1/ingredients/{ingredient.id}/",
        {"name": "Updated ingredient name"},
        content_type="application/json",
    )

    assert res.status_code == 200
    assert RecipeHistorical.objects.filter(recipe_id=recipe.id).count() == before + 1


def test_ingredient_delete_saves_version() -> None:
    client = Client()
    user = create_user()
    team = create_team(user=user)
    recipe = create_recipe(team=team, user=user)
    client.force_login(user)
    ingredient = recipe.ingredient_set.all()[:1].get()

    before = RecipeHistorical.objects.filter(recipe_id=recipe.id).count()

    res = client.delete(f"/api/v1/ingredients/{ingredient.id}/")

    assert res.status_code == 204
    assert RecipeHistorical.objects.filter(recipe_id=recipe.id).count() == before + 1
