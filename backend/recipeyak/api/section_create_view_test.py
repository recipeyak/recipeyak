import pytest
from django.test.client import Client

from recipeyak.models import Recipe, RecipeChange, Section, Team, User

pytestmark = pytest.mark.django_db


def test_creating_section(client: Client, user: User, recipe: Recipe) -> None:
    client.force_login(user)

    before_section_count = Section.objects.count()
    data = {"title": "a section title", "position": "17.76"}

    assert RecipeChange.objects.count() == 0

    res = client.post(
        f"/api/v1/recipes/{recipe.id}/sections", data, content_type="application/json"
    )

    assert res.status_code == 200
    assert isinstance(res.json()["id"], int)
    assert isinstance(res.json()["title"], str)
    assert isinstance(res.json()["position"], str)
    assert res.json()["title"] == data["title"]
    assert res.json()["position"] == data["position"]

    after_section_count = Section.objects.count()
    assert after_section_count == before_section_count + 1

    assert RecipeChange.objects.count() == 1
    recipe_change = RecipeChange.objects.get()
    assert recipe_change.recipe is not None
    assert recipe_change.recipe.id == recipe.id


def test_creating_section_without_position(
    client: Client, user: User, recipe: Recipe
) -> None:
    client.force_login(user)

    before_section_count = Section.objects.count()
    data = {"title": "a section title"}

    assert RecipeChange.objects.count() == 0

    res = client.post(
        f"/api/v1/recipes/{recipe.id}/sections", data, content_type="application/json"
    )

    assert res.status_code == 200
    assert isinstance(res.json()["id"], int)
    assert isinstance(res.json()["title"], str)
    assert isinstance(res.json()["position"], str)
    assert res.json()["title"] == data["title"]

    after_section_count = Section.objects.count()
    assert after_section_count == before_section_count + 1

    assert RecipeChange.objects.count() == 1
    recipe_change = RecipeChange.objects.get()
    assert recipe_change.recipe is not None
    assert recipe_change.recipe.id == recipe.id

    assert (
        max(
            list(recipe.ingredient_set.values_list("position", flat=True))
            + list(recipe.section_set.values_list("position", flat=True))
        )
        == res.json()["position"]
    )


def test_fetching_sections_for_recipe(
    client: Client, user: User, recipe: Recipe, team: Team
) -> None:
    """
    check both team list view and list view
    """
    client.force_login(user)

    recipe.team = team
    recipe.save()

    # detail
    res = client.get(f"/api/v1/recipes/{recipe.id}/")
    assert res.status_code == 200
    assert isinstance(res.json()["sections"], list)
    assert res.json()["sections"]
    for s in res.json()["sections"]:
        assert isinstance(s["id"], int)
        assert isinstance(s["title"], str)
        assert isinstance(s["position"], str)

    team.recipe_set.add(recipe)


def test_updating_section(client: Client, user: User, recipe: Recipe) -> None:
    client.force_login(user)

    section = Section.objects.create(
        recipe=recipe, title="a new section", position="88.0"
    )

    data = {"title": "different section title", "position": "123.0"}
    assert data["title"] != section.title
    assert data["position"] != section.position
    assert RecipeChange.objects.count() == 0

    res = client.patch(
        f"/api/v1/sections/{section.id}/", data, content_type="application/json"
    )

    assert res.status_code == 200
    assert res.json()["title"] == data["title"]
    assert res.json()["position"] == data["position"]
    assert RecipeChange.objects.count() == 1
    recipe_change = RecipeChange.objects.get()
    assert recipe_change.recipe is not None
    assert recipe_change.recipe.id == recipe.id

    res = client.patch(
        f"/api/v1/sections/{section.id}/",
        {"position": "124.0"},
        content_type="application/json",
    )
    assert res.status_code == 200
    assert res.json()["position"] == "124.0"


def test_deleting_section(client: Client, user: User, recipe: Recipe) -> None:
    client.force_login(user)

    section = Section.objects.create(
        recipe=recipe, title="a new section", position="88.0"
    )
    before_count = recipe.section_set.count()
    assert RecipeChange.objects.count() == 0

    res = client.delete(f"/api/v1/sections/{section.id}/")

    assert res.status_code == 204
    after_count = recipe.section_set.count()
    assert after_count == before_count - 1
    assert RecipeChange.objects.count() == 1
    recipe_change = RecipeChange.objects.get()
    assert recipe_change.recipe is not None
    assert recipe_change.recipe.id == recipe.id
