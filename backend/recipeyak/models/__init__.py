from __future__ import annotations

from typing import TYPE_CHECKING

from django.db.models import QuerySet
from django.shortcuts import get_object_or_404

from recipeyak.models.ingredient import Ingredient
from recipeyak.models.invite import Invite  # noqa: F401
from recipeyak.models.membership import Membership, get_random_ical_id  # noqa: F401
from recipeyak.models.note import Note
from recipeyak.models.reaction import Reaction
from recipeyak.models.recipe import Recipe
from recipeyak.models.recipe_change import ChangeType, RecipeChange  # noqa: F401
from recipeyak.models.recipe_cook_checklist_check import (
    RecipeCookChecklistCheck,
)
from recipeyak.models.recipe_view import RecipeView  # noqa: F401
from recipeyak.models.schedule_event import ScheduleEvent  # noqa: F401
from recipeyak.models.scheduled_recipe import ScheduledRecipe  # noqa: F401
from recipeyak.models.scrape import Scrape  # noqa: F401
from recipeyak.models.search_click import SearchClick  # noqa: F401
from recipeyak.models.section import Section  # noqa: F401
from recipeyak.models.shopping_list import ShoppingList  # noqa: F401
from recipeyak.models.step import Step
from recipeyak.models.team import Team
from recipeyak.models.timeline_event import TimelineEvent  # noqa: F401
from recipeyak.models.upload import Upload  # noqa: F401
from recipeyak.models.user import User

if TYPE_CHECKING:
    from recipeyak.api.base.request import AuthedRequest


def get_team(request: AuthedRequest) -> Team:
    # HACK: ideally we'd have this accessible on the request (request.team) but
    # with DRF it's close to impossible to access authed user
    # see: https://stackoverflow.com/questions/26240832/django-and-middleware-which-uses-request-user-is-always-anonymous

    # Also, we should send the team with the request. `user.schedule_team`
    # should only be used to populate the default team value on login.
    # If we send it with the request, then a user can have multiple tabs work
    # properly.
    team_id = request.user.schedule_team_id
    assert team_id is not None, "should always have a team selected"
    return get_team_by_id(request=request, team_id=team_id)


def get_team_by_id(*, request: AuthedRequest, team_id: int) -> Team:
    return get_object_or_404(
        Team.objects.filter(
            membership__user_id=request.user.id,
            membership__is_active=True,
        ),
        id=team_id,
    )


def filter_recipes(*, team: Team) -> QuerySet[Recipe]:
    return Recipe.objects.filter(team=team).prefetch_related(
        "step_set",
        "ingredient_set",
        "scheduledrecipe_set",
        "notes",
        "notes__created_by",
        "notes__last_modified_by",
        "notes__uploads",
        "notes__reactions",
        "notes__reactions__created_by",
        "timelineevent_set",
        "timelineevent_set__created_by",
        "section_set",
        "primary_image",
        "primary_image__created_by",
        "primary_image__recipe",
    )


def filter_recipe_or_404(*, recipe_id: str, team: Team) -> Recipe:
    return get_object_or_404(filter_recipes(team=team), pk=recipe_id)


def filter_cook_checklist(*, team: Team) -> QuerySet[RecipeCookChecklistCheck]:
    return RecipeCookChecklistCheck.objects.filter(recipe__in=filter_recipes(team=team))


def filter_ingredients(*, team: Team) -> QuerySet[Ingredient]:
    return Ingredient.objects.filter(recipe__in=filter_recipes(team=team))


def filter_steps(*, team: Team) -> QuerySet[Step]:
    return Step.objects.filter(recipe__in=filter_recipes(team=team))


def filter_notes(*, team: Team) -> QuerySet[Note]:
    return Note.objects.filter(recipe__in=filter_recipes(team=team))


def user_reactions(*, user: User) -> QuerySet[Reaction]:
    return Reaction.objects.filter(created_by=user)
