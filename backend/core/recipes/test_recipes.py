from datetime import datetime

import pytest
from django.utils.dateparse import parse_datetime
from rest_framework import status
from rest_framework.test import APIClient
from syrupy.matchers import path_type
from core import ordering

from core.models import (
    Ingredient,
    Membership,
    Note,
    Recipe,
    Step,
    Team,
    TimelineEvent,
    User,
)

pytestmark = pytest.mark.django_db


def test_recipe_creation(client, user, team):
    """
    ensure that the user can create recipes
    """
    client.force_authenticate(user)

    data = {
        "team": team.id,
        "name": "Recipe name",
    }

    res = client.post("/api/v1/recipes/", data)
    assert res.status_code == status.HTTP_201_CREATED

    recipe_id = res.json().get("id")
    res = client.get(f"/api/v1/recipes/{recipe_id}/")
    assert res.status_code == status.HTTP_200_OK

    assert isinstance(
        parse_datetime(res.json()["created"]), datetime
    ), "return a valid date time string"


def test_creating_recipe_with_empty_ingredients_and_steps(client, user, team):
    """
    ensure we can create a recipe without ingredients or steps
    """

    client.force_authenticate(user)

    data = {"name": "some recipe", "team": team.id}

    res = client.post("/api/v1/recipes/", data)
    assert res.status_code == 201


def test_cache_headers(client: APIClient, user: User, recipe: Recipe) -> None:
    """
    check that we actually disable caching
    """
    client.force_authenticate(user)

    res = client.get(f"/api/v1/recipes/{recipe.id}/")
    assert res.status_code == status.HTTP_200_OK
    assert res["Cache-Control"] == "no-store, no-cache, must-revalidate"


def test_recipe_creation_for_a_team(client, team, user):
    """
    ensure that the user can create recipe for a team
    """

    assert team.is_member(user)

    client.force_authenticate(user)

    assert TimelineEvent.objects.count() == 0

    data = {
        "name": "Recipe name",
        "ingredients": [
            {
                "quantity": "1",
                "unit": "tablespoon",
                "name": "black pepper",
                "description": "",
            }
        ],
        "steps": [{"text": "place fish in salt"}],
        "team": team.id,
    }

    url = "/api/v1/recipes/"

    res = client.post(url, data)
    assert res.status_code == status.HTTP_201_CREATED

    assert (
        TimelineEvent.objects.count()
        == TimelineEvent.objects.filter(action="created").count()
        == 1
    )

    recipe_id = res.json()["id"]

    assert isinstance(Recipe.objects.get(id=recipe_id).owner, Team)

    assert client.get(f"/api/v1/recipes/{recipe_id}/").status_code == status.HTTP_200_OK

    assert Team.objects.get(id=team.id).recipes.first().id == recipe_id


def test_recipe_deletion(client, user, recipe):
    """
    ensure that the user can delete a recipe
    """
    client.force_authenticate(user)

    res = client.delete(f"/api/v1/recipes/{recipe.id}/")
    assert res.status_code == status.HTTP_204_NO_CONTENT

    res = client.get(f"/api/v1/recipes/{recipe.id}/")
    assert res.status_code == status.HTTP_404_NOT_FOUND


def test_recipe_updating(client, user, recipe):
    """
    ensure a user can update a recipe
    """
    client.force_authenticate(user)

    data = {"name": "A new name"}

    assert recipe.name != data.get("name")

    res = client.patch(f"/api/v1/recipes/{recipe.id}/", data)
    assert res.status_code == status.HTTP_200_OK

    assert res.json().get("name") == data.get("name")


def test_recipe_archived_at(client, user, recipe):
    """
    check we can set archived_at on the recipe
    """
    client.force_authenticate(user)

    res = client.get("/api/v1/recipes/")
    assert res.status_code == status.HTTP_200_OK
    assert len(res.json()) == 1
    assert res.json()[0]["archived_at"] is None, "archived_at should be on list view"

    res = client.get(f"/api/v1/recipes/{recipe.id}/")
    assert res.status_code == status.HTTP_200_OK
    assert res.json()["archived_at"] is None, "archived_at should be on detail view"

    assert TimelineEvent.objects.count() == 0

    data = {"archived_at": datetime.now()}
    res = client.patch(f"/api/v1/recipes/{recipe.id}/", data)
    assert res.status_code == status.HTTP_200_OK
    assert isinstance(res.json()["archived_at"], str), "should be a date string"

    res = client.get("/api/v1/recipes/")
    assert res.status_code == status.HTTP_200_OK
    assert len(res.json()) == 1
    assert isinstance(res.json()[0]["archived_at"], str), "should be a date string"
    assert all(
        item["created_by"]["email"] == user.email
        for item in res.json()[0]["timelineItems"]
    ), "should have user email"

    assert (
        TimelineEvent.objects.count()
        == TimelineEvent.objects.filter(action="archived").count()
        == 1
    )

    res = client.patch(f"/api/v1/recipes/{recipe.id}/", {"archived_at": None})
    assert res.status_code == status.HTTP_200_OK
    assert res.json()["archived_at"] is None

    assert TimelineEvent.objects.count() == 2
    assert TimelineEvent.objects.filter(action="archived").count() == 1
    assert TimelineEvent.objects.filter(action="unarchived").count() == 1


def test_recipe_list_timeline_items(client, user, recipe, snapshot):
    """
    Verify we list timeline items with the correct keys.
    """
    client.force_authenticate(user)

    res = client.get("/api/v1/recipes/")
    assert res.status_code == status.HTTP_200_OK
    assert len(res.json()) == 1
    timeline_items = res.json()[0]["timelineItems"]
    assert sorted(timeline_items, key=lambda x: str(x["text"])) == snapshot(
        matcher=path_type(
            {
                r".*\.recipe_id": (int,),
                r".*\.created": (str,),
                r".*\.modified": (str,),
                r".*\.id": (int,),
                r".*\.last_modified_by\.id": (int,),
                r".*\.created_by\.id": (int,),
            },
            regex=True,
        )
    )


def test_updating_step_of_recipe(client, user, recipe):
    """
    ensure a user can update an step of a recipe
    """
    client.force_authenticate(user)

    step = recipe.steps[0]

    step_data = {
        "text": "An updated step",
        "position": step.position + chr(ordering.END_CHAR_CODE),
    }

    url = f"/api/v1/recipes/{recipe.id}/steps/{step.id}/"

    res = client.patch(url, step_data)
    assert res.status_code == status.HTTP_200_OK

    res = client.get(f"/api/v1/recipes/{recipe.id}/")
    assert res.status_code == status.HTTP_200_OK
    updated_step = next((x for x in res.json()["steps"] if x["id"] == step.pk))

    assert updated_step.get("id") is not None

    for key, value in step_data.items():
        assert updated_step.get(key) == value


def test_deleting_step_from_recipe(client, user, recipe):
    """
    ensure a user can remove a step from a recipe
    """
    client.force_authenticate(user)

    step_id = recipe.steps[0].id

    assert isinstance(step_id, int)

    res = client.delete(f"/api/v1/recipes/{recipe.id}/steps/{step_id}/")
    assert res.status_code == status.HTTP_204_NO_CONTENT

    res = client.get(f"/api/v1/recipes/{recipe.id}/")
    assert res.status_code == status.HTTP_200_OK

    assert step_id not in (
        step.get("id") for step in res.json().get("steps")
    ), "step was still in the recipe after being deleted"


ingredient = {
    "quantity": "1",
    "unit": "tablespoon",
    "name": "black pepper",
    "description": "",
}
step = {"text": "place fish in salt"}


@pytest.mark.parametrize(
    "data,url_template,model",
    [
        (ingredient, "/api/v1/recipes/{recipe_id}/ingredients/", Ingredient),
        (step, "/api/v1/recipes/{recipe_id}/steps/", Step),
    ],
)
def test_position_step_ingredient(client, user, recipe, data, url_template, model):
    """
    Catch bug in positioning code where soft deletion would hide already taken
    position from application code. This triggered an integrity error at the
    database level.
    """
    client.force_authenticate(user)
    url = url_template.format(recipe_id=recipe.id)

    res = client.post(url, data)
    assert res.status_code == status.HTTP_201_CREATED
    model.objects.get(id=res.json()["id"]).delete()
    res = client.post(url, data)
    assert res.status_code == status.HTTP_201_CREATED


def test_adding_note_to_recipe(client, user, recipe):
    Note.objects.all().delete()
    client.force_authenticate(user)
    data = {"text": "use a mixer to speed things along.", "attachment_upload_ids": []}
    res = client.post(f"/api/v1/recipes/{recipe.id}/notes/", data)
    assert status.is_success(res.status_code)
    assert res.json()["created_by"]["id"] == user.id
    assert res.json()["text"] == data["text"]


def test_modifying_note_of_recipe(client, user, user2, recipe):
    note = recipe.notes.first()
    client.force_authenticate(user)
    data = {"text": "preheat the oven!!"}
    res = client.patch(f"/api/v1/notes/{note.id}/", data)
    assert status.is_success(res.status_code)
    assert res.json()["last_modified_by"]["id"] == user.id
    assert res.json()["created_by"]["id"] == user.id


def test_delete_note(client, user, user2, recipe):
    note = recipe.notes.first()
    client.force_authenticate(user)
    before_count = recipe.notes.count()
    assert before_count > 0
    res = client.delete(f"/api/v1/notes/{note.id}/")
    assert status.is_success(res.status_code)
    assert recipe.notes.count() == before_count - 1


def test_adding_ingredient_to_recipe(client, user, recipe):
    """
    ensure a user can add a ingredient to a recipe
    """
    client.force_authenticate(user)

    ingredient = {
        "quantity": "1",
        "unit": "tablespoon",
        "name": "black pepper",
        "description": "",
    }

    res = client.post(f"/api/v1/recipes/{recipe.id}/ingredients/", ingredient)
    assert res.status_code == status.HTTP_201_CREATED

    res = client.get(f"/api/v1/recipes/{recipe.id}/")
    assert res.status_code == status.HTTP_200_OK
    assert isinstance(res.json()["sections"], list)

    assert ingredient.get("name") in (
        ingredient.get("name") for ingredient in res.json().get("ingredients")
    ), "ingredient was not in the ingredients of the recipe"


def test_updating_ingredient_of_recipe(client, user, recipe):
    """
    ensure a user can update an ingredient of a recipe
    """
    client.force_authenticate(user)

    ingredient_id = recipe.ingredients[0].id

    ingredient = {"name": "black pepper"}

    res = client.patch(
        f"/api/v1/recipes/{recipe.id}/ingredients/{ingredient_id}/", ingredient
    )
    assert res.status_code == status.HTTP_200_OK

    res = client.get(f"/api/v1/recipes/{recipe.id}/")
    assert res.status_code == status.HTTP_200_OK

    updated_ingredient = next(
        (x for x in res.json()["ingredients"] if x["id"] == ingredient_id)
    )

    assert updated_ingredient.get("name") == ingredient.get(
        "name"
    ), "ingredient didn't update"


def test_updating_ingredient_position(client, user, recipe):
    """
    ensure we can update the position, necessary for drag and drop in the ui
    """
    client.force_authenticate(user)

    ingredient = recipe.ingredients[0]

    data = {"position": "15"}
    assert data["position"] != ingredient.position

    res = client.patch(
        f"/api/v1/recipes/{recipe.id}/ingredients/{ingredient.id}/", data
    )
    assert res.status_code == status.HTTP_200_OK
    ingredient.refresh_from_db()
    assert res.json()["position"] == data["position"] == ingredient.position


def test_deleting_ingredient_from_recipe(client, user, recipe):
    """
    ensure a user can remove a ingredient from a recipe
    """
    client.force_authenticate(user)

    ingredient_id = recipe.ingredients[0].id

    res = client.delete(f"/api/v1/recipes/{recipe.id}/ingredients/{ingredient_id}/")
    assert res.status_code == status.HTTP_204_NO_CONTENT

    res = client.get(f"/api/v1/recipes/{recipe.id}/")
    assert res.status_code == status.HTTP_200_OK

    assert ingredient_id not in (
        ingredient.get("id") for ingredient in res.json().get("ingredients")
    ), "ingredient was still in the recipe after being deleted"


def test_display_all_accessable_recipes(
    client, user, recipes, team_with_recipes_no_members
):
    """
    User should be able to list all teams they have access to:
        - User-owned recipes
        - Team-owned recipes
    Ensure user can only view team recipes if they have joined.
    """

    client.force_authenticate(user)
    team_with_recipes_no_members.invite_user(user, creator=user)
    res = client.get("/api/v1/recipes/")
    assert res.status_code == status.HTTP_200_OK
    assert len(res.json()) == len(user.recipes.all())

    team_with_recipes_no_members.force_join(user)
    res = client.get("/api/v1/recipes/")
    assert res.status_code == status.HTTP_200_OK
    assert len(res.json()) == len(user.recipes.all()) + len(
        team_with_recipes_no_members.recipes.all()
    )


def test_recording_edits_for_recipes(client, user, recipe):
    """
    ensure edits being recorded for recipes
    """
    client.force_authenticate(user)

    assert recipe.edits == 0

    recipe.name = "A different name"
    recipe.save()

    assert recipe.edits == 1


def test_updating_edit_recipe_via_api(client, user, recipe):
    """
    ensure edits occur when updating the recipe via the api
    """
    client.force_authenticate(user)

    res = client.patch(f"/api/v1/recipes/{recipe.id}/", {"name": "A new name"})
    assert res.status_code == status.HTTP_200_OK

    assert Recipe.objects.get(pk=recipe.id).edits == 1


def test_updating_edit_recipe_via_api_empty_tags(client, user, recipe):
    """
    regression test to allow empty lists for tags
    """
    client.force_authenticate(user)

    res = client.patch(f"/api/v1/recipes/{recipe.id}/", {"tags": []})
    assert res.status_code == status.HTTP_200_OK


def test_copy_recipe(client, user_with_recipes, empty_team, user3):
    """
    Users can copy recipe to team if they have write access.
    """
    recipe = user_with_recipes.recipes.first()
    url = f"/api/v1/recipes/{recipe.id}/copy/"

    # user must own recipe to copy it
    client.force_authenticate(user3)
    assert recipe.owner != user3
    assert (
        client.post(
            url, {"id": empty_team.id, "type": "team", "name": empty_team.name}
        ).status_code
        == status.HTTP_404_NOT_FOUND
    )

    # team viewer cannot add recipe to team
    client.force_authenticate(user_with_recipes)
    empty_team.force_join(user_with_recipes, level=Membership.READ_ONLY)
    assert recipe.owner == user_with_recipes
    assert (
        client.post(url, {"id": empty_team.id, "type": "team"}).status_code
        == status.HTTP_403_FORBIDDEN
    )

    # contributors and admins can add recipe to team
    empty_team.force_join(user_with_recipes, level=Membership.CONTRIBUTOR)
    res = client.post(url, {"id": empty_team.id, "type": "team"})
    assert res.status_code == status.HTTP_200_OK
    assert res.json()["id"] != recipe.id
    assert res.json()["owner"] == {
        "id": empty_team.id,
        "type": "team",
        "name": empty_team.name,
    }


def test_move_recipe(client, user_with_recipes, empty_team, user3):
    """
    Users can move recipe to team if they have write access.
    """
    recipe = user_with_recipes.recipes.first()
    url = f"/api/v1/recipes/{recipe.id}/move/"

    # user must own recipe to copy it
    client.force_authenticate(user3)
    assert recipe.owner != user3
    assert (
        client.post(url, {"id": empty_team.id, "type": "team"}).status_code
        == status.HTTP_404_NOT_FOUND
    )

    # team viewer cannot add recipe to team
    client.force_authenticate(user_with_recipes)
    empty_team.force_join(user_with_recipes, level=Membership.READ_ONLY)
    res = client.post(url, {"id": empty_team.id, "type": "team"})
    assert res.status_code == status.HTTP_403_FORBIDDEN

    # members can add recipe to team
    empty_team.force_join(user_with_recipes, level=Membership.CONTRIBUTOR)
    res = client.post(url, {"id": empty_team.id, "type": "team"})
    assert res.status_code == status.HTTP_200_OK
    assert res.json()["id"] == recipe.id
    assert res.json()["owner"] == {
        "id": empty_team.id,
        "type": "team",
        "name": empty_team.name,
    }


def test_duplicate_recipe_view(
    client: APIClient, user: User, recipe: Recipe, user2: User
) -> None:
    """
    Duplicating a recipe should return the response type of recipe detail
    endpoint
    """

    res = client.post(f"/api/v1/recipes/{recipe.id}/duplicate/")
    assert res.status_code == status.HTTP_403_FORBIDDEN

    client.force_authenticate(user2)

    res = client.post(f"/api/v1/recipes/{recipe.id}/duplicate/")
    assert res.status_code == status.HTTP_404_NOT_FOUND

    client.force_authenticate(user)

    res = client.post(f"/api/v1/recipes/{recipe.id}/duplicate/")
    assert res.status_code == status.HTTP_200_OK

    assert res.json()["id"] != recipe.id
    duped_recipe = Recipe.objects.get(id=res.json()["id"])

    # default clone values for an original
    assert recipe.cloned_at is None
    assert recipe.cloned_by is None
    assert recipe.cloned_from is None

    assert duped_recipe.cloned_by == user
    assert isinstance(duped_recipe.cloned_at, datetime)
    assert duped_recipe.cloned_from == recipe

    assert res.json()["name"] == "Recipe name (copy)"
