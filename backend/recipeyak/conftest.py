from __future__ import annotations

from datetime import date
from logging import getLogger
from typing import Any

import pytest
from rest_framework.test import APIClient

from recipeyak.models import (
    Ingredient,
    Note,
    Recipe,
    ScheduledRecipe,
    Section,
    Step,
    Team,
    User,
)

getLogger("flake8").propagate = False


@pytest.fixture
def user() -> User:
    """
    Connected to `team`. Has 5 recipes. Member of `team`.
    """
    email = "john@doe.org"
    return User.objects.create_user(email=email)


@pytest.fixture
def user_with_recipes(recipes: list[Recipe]) -> Any:
    first_recipe, *_ = recipes
    return first_recipe.owner


@pytest.fixture
def user2() -> User:
    email = "james@smith.org"
    user2 = User.objects.create_user(email=email)
    team = Team.objects.create(name="another team")
    team.force_join_admin(user=user2)
    user2.schedule_team = team
    user2.save()
    return user2


@pytest.fixture
def user3() -> User:
    email = "john.doe@example.org"
    user3 = User.objects.create_user(email=email)
    team = Team.objects.create(name="another team")
    team.force_join_admin(user=user3)
    user3.schedule_team = team
    user3.save()
    return user3


@pytest.fixture
def client() -> APIClient:
    return APIClient()


@pytest.fixture
def client_b() -> APIClient:
    return APIClient()


@pytest.fixture
def recipes(user: User, team: Team) -> list[Recipe]:
    """
    list of empty recipes with different modified times owned by `user`
    note: each item will have a different creation time inherently
    """

    name = "Recipe name"
    author = "Recipe author"

    return Recipe.objects.bulk_create(
        [Recipe(name=name, author=author, owner=user, team=team) for n in range(15)]
    )


@pytest.fixture
def empty_recipe(user: User) -> Recipe:
    """
    Empty recipe owned by `user`
    """
    name = "empty recipe"
    return Recipe.objects.create(name=name, owner=user)


@pytest.fixture
def recipe(user: User) -> Recipe:
    """
    Recipe with metadata, Ingredient, Step owned by `user`
    """

    name = "Recipe name"
    author = "Recipe author"
    source = "www.exmple.com"
    time = "1 hour"

    recipe = Recipe.objects.create(
        name=name, author=author, source=source, time=time, owner=user
    )

    Ingredient.objects.create(
        quantity="1 lbs",
        name="egg",
        description="scrambled",
        position=10.0,
        recipe=recipe,
    )

    Ingredient.objects.create(
        quantity="2 tbs", name="soy sauce", position=11.0, recipe=recipe
    )

    Step.objects.create(
        text="Place egg in boiling water and cook for ten minutes",
        position=10.0,
        recipe=recipe,
    )

    Note.objects.create(recipe=recipe, text="Use a small pot.", created_by=user)
    Note.objects.create(
        recipe=recipe,
        text="I'd say we should use an even smaller pot next time.",
        created_by=user,
        last_modified_by=user,
    )

    Section.objects.create(recipe=recipe, title="a section title", position=14.0)
    Section.objects.create(recipe=recipe, title="a diff section", position=5.5)

    return recipe


def recipe_pie_factory(user: User) -> Recipe:
    """
    Recipe with metadata, Ingredient, Step owned by `user`.
    Contains the word "pie" in name and source.
    """
    name = "Brandied Pumpkin Pie"
    author = "Melissa Clark"
    source = "https://cooking.nytimes.com/recipes/1015413-brandied-pumpkin-pie"
    time = "4 hours"

    recipe = Recipe.objects.create(
        name=name, author=author, source=source, time=time, owner=user
    )

    Ingredient.objects.create(
        quantity="150 grams", name="all-purpose flour", position=10.0, recipe=recipe
    )

    Ingredient.objects.create(
        quantity="0.25 teaspoon", name="fine sea salt", position=11.0, recipe=recipe
    )

    Step.objects.create(
        text="Make the crust: In a food processor, pulse together the flour and salt.",
        position=10.0,
        recipe=recipe,
    )

    return recipe


@pytest.fixture
def recipe_pie(user: User) -> Recipe:
    return recipe_pie_factory(user)


@pytest.fixture
def recipe2(user: User) -> Recipe:
    """
    Pie recipe owned by `user`
    """
    return recipe_pie_factory(user)


@pytest.fixture
def team(user: User) -> Team:
    team = Team.objects.create(name="Recipe Yak Team")
    team.force_join_admin(user=user)
    user.schedule_team = team
    user.save()
    return team


@pytest.fixture
def empty_team() -> Team:
    return Team.objects.create(name="The Hateful Eight")


@pytest.fixture
def team_with_recipes(team: Team, recipe: Recipe, recipe_pie: Recipe) -> Team:
    team.recipes.add(recipe)
    team.recipes.add(recipe_pie)
    return team


@pytest.fixture
def team_with_recipes_no_members(recipe: Recipe, recipe_pie: Recipe) -> Team:
    t = Team.objects.create(name="A Team with No Name")
    t.recipes.add(recipe)
    t.recipes.add(recipe_pie)
    return t


@pytest.fixture
def scheduled_recipe(recipe: Recipe, user: User) -> ScheduledRecipe:
    return ScheduledRecipe.objects.create(recipe=recipe, user=user, on=date(1976, 7, 6))
