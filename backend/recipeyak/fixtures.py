"""
Create test data
"""

from recipeyak.models.ingredient import Ingredient
from recipeyak.models.note import Note
from recipeyak.models.recipe import Recipe
from recipeyak.models.section import Section
from recipeyak.models.step import Step
from recipeyak.models.team import Team
from recipeyak.models.user import User
from recipeyak.versioning import save_recipe_version


def create_user(*, email: str = "j.person@example.com") -> User:
    return User.objects.create_user(email=email)


def create_team(*, user: User) -> Team:
    team = Team.objects.create(name="Recipe Yak Team")
    team.force_join_admin(user=user)
    user.schedule_team = team
    user.save()
    return team


def create_recipe(*, team: Team, user: User, source: str | None = None) -> Recipe:
    recipe = Recipe.objects.create(
        name="Recipe name",
        author="Recipe author",
        source=source or "www.exmple.com",
        time="1 hour",
        team=team,
    )

    Section.objects.create(recipe=recipe, title="a section title", position="a")
    create_ingredient(
        recipe=recipe,
        quantity="1 lbs",
        name="egg",
        description="scrambled",
        position="b",
    )

    Section.objects.create(recipe=recipe, title="a diff section", position="b")

    create_ingredient(
        recipe=recipe,
        quantity="2 tbs",
        name="soy sauce",
        position="c",
    )

    Step.objects.create(
        text="Place egg in boiling water and cook for ten minutes",
        position="a",
        recipe=recipe,
    )

    Step.objects.create(
        text="serve",
        position="b",
        recipe=recipe,
    )

    Note.objects.create(recipe=recipe, text="Use a small pot.", created_by=user)
    Note.objects.create(
        recipe=recipe,
        text="I'd say we should use an even smaller pot next time.",
        created_by=user,
        last_modified_by=user,
    )

    # mimic what we do in the API
    save_recipe_version(recipe_id=recipe.id, actor=user)

    return recipe


def create_ingredient(
    *, recipe: Recipe, quantity: str, name: str, description: str = "", position: str
) -> Ingredient:
    return Ingredient.objects.create(
        quantity=quantity,
        name=name,
        description=description,
        recipe=recipe,
        position=position,
    )
