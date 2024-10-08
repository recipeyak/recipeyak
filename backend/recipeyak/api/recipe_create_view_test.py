from __future__ import annotations

from datetime import UTC, datetime
from typing import Any
from unittest.mock import patch

import advocate
import pytest
import requests
from django.core.exceptions import ValidationError
from django.test.client import Client
from django.utils.dateparse import parse_datetime
from recipe_scrapers._exceptions import RecipeScrapersExceptions

from recipeyak import ordering
from recipeyak.fixtures import create_recipe, create_team, create_user
from recipeyak.models import Ingredient, Note, Recipe, Step, Team, TimelineEvent, User
from recipeyak.scraper.scrape_recipe import ScrapeResult

pytestmark = pytest.mark.django_db


def test_recipe_creation(client: Client, user: User, team: Team) -> None:
    """
    ensure that the user can create recipes
    """
    client.force_login(user)

    data = {
        "team": team.id,
        "name": "Recipe name",
    }

    res = client.post("/api/v1/recipes/", data, content_type="application/json")
    assert res.status_code == 200

    recipe_id = res.json().get("id")
    res = client.get(f"/api/v1/recipes/{recipe_id}/")
    assert res.status_code == 200

    assert isinstance(
        parse_datetime(res.json()["created"]), datetime
    ), "return a valid date time string"


def test_creating_recipe_with_empty_ingredients_and_steps(
    client: Client, user: User, team: Team
) -> None:
    """
    ensure we can create a recipe without ingredients or steps
    """

    client.force_login(user)

    data = {"name": "some recipe", "team": team.id}

    res = client.post("/api/v1/recipes/", data, content_type="application/json")
    assert res.status_code == 200


def test_cache_headers(client: Client, user: User, recipe: Recipe, team: Team) -> None:
    """
    check that we actually disable caching
    """
    client.force_login(user)
    recipe.team = team
    recipe.save()

    res = client.get(f"/api/v1/recipes/{recipe.id}/")
    assert res.status_code == 200
    assert res["Cache-Control"] == "no-store, no-cache, must-revalidate"


def test_recipe_creation_for_a_team(client: Client, team: Team, user: User) -> None:
    """
    ensure that the user can create recipe for a team
    """

    assert team.is_member(user)

    client.force_login(user)

    assert TimelineEvent.objects.count() == 0

    data = {
        "name": "Recipe name",
        "team": team.id,
    }

    res = client.post("/api/v1/recipes/", data, content_type="application/json")
    assert res.status_code == 200

    assert (
        TimelineEvent.objects.count()
        == TimelineEvent.objects.filter(action="created").count()
        == 1
    )

    recipe_id = res.json()["id"]

    assert client.get(f"/api/v1/recipes/{recipe_id}/").status_code == 200

    recipe = Team.objects.get(id=team.id).recipe_set.first()
    assert recipe is not None
    assert recipe.id == recipe_id


def test_recipe_deletion(
    client: Client, user: User, recipe: Recipe, team: Team
) -> None:
    """
    ensure that the user can delete a recipe
    """
    recipe.team = team
    recipe.save()

    client.force_login(user)

    res = client.delete(f"/api/v1/recipes/{recipe.id}/")
    assert res.status_code == 204

    res = client.get(f"/api/v1/recipes/{recipe.id}/")
    assert res.status_code == 404


def test_recipe_updating(
    client: Client, user: User, recipe: Recipe, team: Team
) -> None:
    """
    ensure a user can update a recipe
    """
    recipe.team = team
    recipe.save()
    client.force_login(user)

    data = {"name": "A new name"}

    assert recipe.name != data.get("name")

    res = client.patch(
        f"/api/v1/recipes/{recipe.id}/", data, content_type="application/json"
    )
    assert res.status_code == 200

    assert res.json().get("name") == data.get("name")


def test_recipe_archived_at(
    client: Client, user: User, recipe: Recipe, team: Team
) -> None:
    """
    check we can set archived_at on the recipe
    """
    recipe.team = team
    recipe.save()
    client.force_login(user)

    res = client.get(f"/api/v1/recipes/{recipe.id}/")
    assert res.status_code == 200
    assert res.json()["archived_at"] is None, "archived_at should be on detail view"

    assert TimelineEvent.objects.count() == 0

    data = {"archived_at": datetime.now(UTC)}
    res = client.patch(
        f"/api/v1/recipes/{recipe.id}/", data, content_type="application/json"
    )
    assert res.status_code == 200
    assert isinstance(res.json()["archived_at"], str), "should be a date string"

    assert (
        TimelineEvent.objects.count()
        == TimelineEvent.objects.filter(action="archived").count()
        == 1
    )

    res = client.patch(
        f"/api/v1/recipes/{recipe.id}/",
        {"archived_at": None},
        content_type="application/json",
    )
    assert res.status_code == 200
    assert res.json()["archived_at"] is None

    assert TimelineEvent.objects.count() == 2
    assert TimelineEvent.objects.filter(action="archived").count() == 1
    assert TimelineEvent.objects.filter(action="unarchived").count() == 1


def test_updating_step_of_recipe(
    client: Client, user: User, recipe: Recipe, team: Team
) -> None:
    """
    ensure a user can update an step of a recipe
    """
    recipe.team = team
    recipe.save()

    client.force_login(user)

    step = recipe.step_set.all()[0]

    step_data = {
        "text": "An updated step",
        "position": ordering.position_after(step.position),
    }

    res = client.patch(
        f"/api/v1/steps/{step.id}/", step_data, content_type="application/json"
    )
    assert res.status_code == 200

    res = client.get(f"/api/v1/recipes/{recipe.id}/")
    assert res.status_code == 200
    updated_step = next(x for x in res.json()["steps"] if x["id"] == step.pk)

    assert updated_step.get("id") is not None

    for key, value in step_data.items():
        assert updated_step.get(key) == value


def test_deleting_step_from_recipe(
    client: Client, user: User, recipe: Recipe, team: Team
) -> None:
    """
    ensure a user can remove a step from a recipe
    """
    recipe.team = team
    recipe.save()

    client.force_login(user)

    step_id = recipe.step_set.all()[0].id

    assert isinstance(step_id, int)

    res = client.delete(f"/api/v1/steps/{step_id}/")
    assert res.status_code == 204

    res = client.get(f"/api/v1/recipes/{recipe.id}/")
    assert res.status_code == 200

    assert step_id not in (
        step.get("id") for step in res.json().get("steps")
    ), "step was still in the recipe after being deleted"


ingredient = {
    "quantity": "1",
    "name": "black pepper",
    "description": "",
    "position": "a",
}
step = {"text": "place fish in salt", "position": "b"}


@pytest.mark.parametrize(
    ("data", "url_template", "model"),
    [
        (ingredient, "/api/v1/recipes/{recipe_id}/ingredients/", Ingredient),
        (step, "/api/v1/recipes/{recipe_id}/steps/", Step),
    ],
)
def test_position_step_ingredient(
    client: Client,
    user: User,
    recipe: Recipe,
    data: Any,
    url_template: str,
    model: Any,
    team: Team,
) -> None:
    """
    Catch bug in positioning code where soft deletion would hide already taken
    position from application code. This triggered an integrity error at the
    database level.
    """
    recipe.team = team
    recipe.save()
    client.force_login(user)
    url = url_template.format(recipe_id=recipe.id)

    res = client.post(url, data, content_type="application/json")
    assert res.status_code == 200
    model.objects.get(id=res.json()["id"]).delete()
    res = client.post(url, data, content_type="application/json")
    assert res.status_code == 200


def test_adding_note_to_recipe(
    client: Client, user: User, recipe: Recipe, team: Team
) -> None:
    recipe.team = team
    recipe.save()
    Note.objects.all().delete()
    client.force_login(user)
    data = {"text": "use a mixer to speed things along.", "attachment_upload_ids": []}
    res = client.post(
        f"/api/v1/recipes/{recipe.id}/notes/", data, content_type="application/json"
    )
    assert res.status_code == 200
    assert res.json()["created_by"]["id"] == user.id
    assert res.json()["text"] == data["text"]


def test_modifying_note_of_recipe(
    client: Client, user: User, user2: User, recipe: Recipe, team: Team
) -> None:
    recipe.team = team
    recipe.save()
    note = recipe.notes.first()
    client.force_login(user)
    data = {"text": "preheat the oven!!"}
    assert note is not None
    res = client.patch(
        f"/api/v1/notes/{note.id}/", data, content_type="application/json"
    )
    assert res.status_code == 200
    assert res.json()["created_by"]["id"] == user.id


def test_delete_note(
    client: Client, user: User, user2: User, recipe: Recipe, team: Team
) -> None:
    recipe.team = team
    recipe.save()
    note = recipe.notes.first()
    client.force_login(user)
    before_count = recipe.notes.count()
    assert before_count > 0
    assert note is not None
    res = client.delete(f"/api/v1/notes/{note.id}/")
    assert res.status_code == 204
    assert recipe.notes.count() == before_count - 1


def test_adding_ingredient_to_recipe(
    client: Client, user: User, recipe: Recipe, team: Team
) -> None:
    """
    ensure a user can add a ingredient to a recipe
    """
    recipe.team = team
    recipe.save()
    client.force_login(user)

    ingredient = {
        "quantity": "1",
        "name": "black pepper",
        "description": "",
        "position": "a",
    }

    res = client.post(
        f"/api/v1/recipes/{recipe.id}/ingredients/",
        ingredient,
        content_type="application/json",
    )
    assert res.status_code == 200

    res = client.get(f"/api/v1/recipes/{recipe.id}/")
    assert res.status_code == 200
    assert isinstance(res.json()["sections"], list)

    assert ingredient.get("name") in (
        ingredient.get("name") for ingredient in res.json().get("ingredients")
    ), "ingredient was not in the ingredients of the recipe"


def test_updating_ingredient_of_recipe(
    client: Client, user: User, recipe: Recipe, team: Team
) -> None:
    """
    ensure a user can update an ingredient of a recipe
    """
    recipe.team = team
    recipe.save()
    client.force_login(user)

    ingredient_id = recipe.ingredient_set.all()[0].id

    ingredient = {"name": "black pepper"}

    res = client.patch(
        f"/api/v1/ingredients/{ingredient_id}/",
        ingredient,
        content_type="application/json",
    )
    assert res.status_code == 200

    res = client.get(f"/api/v1/recipes/{recipe.id}/")
    assert res.status_code == 200

    updated_ingredient = next(
        x for x in res.json()["ingredients"] if x["id"] == ingredient_id
    )

    assert updated_ingredient.get("name") == ingredient.get(
        "name"
    ), "ingredient didn't update"


def test_updating_ingredient_position(
    client: Client, user: User, recipe: Recipe, team: Team
) -> None:
    """
    ensure we can update the position, necessary for drag and drop in the ui
    """
    recipe.team = team
    recipe.save()
    client.force_login(user)

    ingredient = recipe.ingredient_set.all()[0]

    data = {"position": "15"}
    assert data["position"] != ingredient.position

    res = client.patch(
        f"/api/v1/ingredients/{ingredient.id}/",
        data,
        content_type="application/json",
    )
    assert res.status_code == 200
    ingredient.refresh_from_db()
    assert res.json()["position"] == data["position"] == ingredient.position


def test_deleting_ingredient_from_recipe(
    client: Client, user: User, recipe: Recipe, team: Team
) -> None:
    """
    ensure a user can remove a ingredient from a recipe
    """
    recipe.team = team
    recipe.save()
    client.force_login(user)

    ingredient_id = recipe.ingredient_set.all()[0].id

    res = client.delete(f"/api/v1/ingredients/{ingredient_id}/")
    assert res.status_code == 204

    res = client.get(f"/api/v1/recipes/{recipe.id}/")
    assert res.status_code == 200

    assert ingredient_id not in (
        ingredient.get("id") for ingredient in res.json().get("ingredients")
    ), "ingredient was still in the recipe after being deleted"


def test_updating_edit_recipe_via_api_empty_tags(
    client: Client, user: User, recipe: Recipe, team: Team
) -> None:
    """
    regression test to allow empty lists for tags
    """
    client.force_login(user)
    recipe.team = team
    recipe.save()

    res = client.patch(
        f"/api/v1/recipes/{recipe.id}/", {"tags": []}, content_type="application/json"
    )
    assert res.status_code == 200


def test_create_from_url_does_not_recreate() -> None:
    client = Client()
    user = create_user()
    team = create_team(user=user)
    url = "https://cooking.nytimes.com/recipes/1021424-amus-chicken-korma"
    recipe = create_recipe(team=team, user=user, source=url)
    client.force_login(user)

    with patch(
        "recipeyak.api.recipe_create_view.scrape_recipe",
        return_value=ScrapeResult(
            title=None,
            total_time=None,
            yields=None,
            image=None,
            upload_id=None,
            instructions=[],
            ingredient_groups=[],
            author=None,
            canonical_url=url,
        ),
    ) as mock_scrape:
        res = client.post(
            "/api/v1/recipes/",
            {
                "from_url": url,
                "team": team.id,
            },
            content_type="application/json",
        )

        mock_scrape.assert_called_once()
        assert res.status_code == 200
        assert res.json()["id"] == recipe.id


def test_create_from_url_canonical_already_exists() -> None:
    client = Client()
    user = create_user()
    team = create_team(user=user)
    url = "https://cooking.nytimes.com/recipes/1021424-amus-chicken-korma"
    recipe = create_recipe(team=team, user=user, source=url)
    client.force_login(user)

    with patch(
        "recipeyak.api.recipe_create_view.scrape_recipe",
        return_value=ScrapeResult(
            title=None,
            total_time=None,
            yields=None,
            image=None,
            upload_id=None,
            instructions=[],
            ingredient_groups=[],
            author=None,
            canonical_url=url,
        ),
    ) as mock_scrape:
        res = client.post(
            "/api/v1/recipes/",
            {
                "from_url": url + "?foo=1",
                "team": team.id,
            },
            content_type="application/json",
        )

        mock_scrape.assert_called_once()
        assert res.status_code == 200
        assert res.json()["id"] == recipe.id


def test_create_from_url_creates_dupe() -> None:
    url = "https://cooking.nytimes.com/recipes/1021424-amus-chicken-korma"
    client = Client()
    user = create_user()
    team = create_team(user=user)
    recipe = create_recipe(team=team, user=user)
    client.force_login(user)
    with patch(
        "recipeyak.api.recipe_create_view.scrape_recipe",
        return_value=ScrapeResult(
            title="Amu's Chicken Korma",
            total_time=None,
            yields=None,
            image=None,
            upload_id=None,
            instructions=[],
            ingredient_groups=[],
            author=None,
            canonical_url=url,
        ),
    ) as mock_scrape:
        res = client.post(
            "/api/v1/recipes/",
            {
                "from_url": url + "?foo=1",
                "team": team.id,
            },
            content_type="application/json",
        )

        mock_scrape.assert_called_once()
        assert res.status_code == 200
        assert res.json()["id"] != recipe.id


def test_create_from_url_connection_error() -> None:
    url = "https://cooking.nytimes.com/recipes/1021424-amus-chicken-korma"
    client = Client()
    user = create_user()
    team = create_team(user=user)
    client.force_login(user)
    with patch(
        "recipeyak.api.recipe_create_view.scrape_recipe",
    ) as mock_scrape:
        mock_scrape.side_effect = requests.exceptions.ConnectionError()
        res = client.post(
            "/api/v1/recipes/",
            {
                "from_url": url,
                "team": team.id,
            },
            content_type="application/json",
        )

        mock_scrape.assert_called_once()
        assert res.status_code == 400
        assert res.json()["error"]["code"] == "connection_error"
        assert res.json()["error"]["message"] == "Problem connecting to url."


@pytest.mark.parametrize(
    "exception",
    [
        advocate.exceptions.UnacceptableAddressException(),
        ValidationError("invalid url"),
        RecipeScrapersExceptions("invalid url"),
    ],
)
def test_create_from_url_invalid_url_error(exception: Exception) -> None:
    url = "https://cooking.nytimes.com/recipes/1021424-amus-chicken-korma"
    client = Client()
    user = create_user()
    team = create_team(user=user)
    client.force_login(user)
    with patch(
        "recipeyak.api.recipe_create_view.scrape_recipe",
    ) as mock_scrape:
        mock_scrape.side_effect = exception
        res = client.post(
            "/api/v1/recipes/",
            {
                "from_url": url,
                "team": team.id,
            },
            content_type="application/json",
        )

        mock_scrape.assert_called_once()
        assert res.status_code == 400
        assert res.json()["error"]["code"] == "invalid_url"
        assert res.json()["error"]["message"] == "Invalid url."
