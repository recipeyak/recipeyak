from __future__ import annotations

import logging
from datetime import date, datetime

import pydantic

from recipeyak.api.base.serialization import RequestParams
from recipeyak.models.scheduled_recipe import ScheduledRecipe

logger = logging.getLogger(__name__)


class ScheduledRecipeUpdateParams(RequestParams):
    on: date | None


class CreatedBySerializer(pydantic.BaseModel):
    id: int
    name: str
    avatar_url: str


class RecipePrimaryImageSerializer(pydantic.BaseModel):
    id: str
    url: str
    backgroundUrl: str | None


class RecipeMetadataSerializer(pydantic.BaseModel):
    id: int
    name: str
    author: str | None = None
    archivedAt: datetime | None = None
    primaryImage: RecipePrimaryImageSerializer | None = None


class ScheduleRecipeSerializer(pydantic.BaseModel):
    id: int
    created: datetime
    createdBy: CreatedBySerializer | None
    team: int | None
    user: int | None
    recipe: RecipeMetadataSerializer
    on: date


def serialize_scheduled_recipe(
    scheduled_recipe: ScheduledRecipe, user_id: int, team_id: int
) -> ScheduleRecipeSerializer:
    return ScheduleRecipeSerializer(
        id=scheduled_recipe.id,
        created=scheduled_recipe.created,
        createdBy=CreatedBySerializer(
            id=scheduled_recipe.created_by.id,
            name=scheduled_recipe.created_by.get_display_name(),
            avatar_url=scheduled_recipe.created_by.avatar_url,
        )
        if scheduled_recipe.created_by
        else None,
        recipe=RecipeMetadataSerializer(
            id=scheduled_recipe.recipe_id,
            name=scheduled_recipe.recipe.name,
            author=scheduled_recipe.recipe.author,
            archivedAt=scheduled_recipe.recipe.archived_at,
            primaryImage=RecipePrimaryImageSerializer(
                id=str(scheduled_recipe.recipe.primary_image.id),
                url=scheduled_recipe.recipe.primary_image.public_url(),
                backgroundUrl=scheduled_recipe.recipe.primary_image.background_url,
            )
            if scheduled_recipe.recipe.primary_image
            else None,
        ),
        on=scheduled_recipe.on,
        user=user_id,
        team=team_id,
    )
