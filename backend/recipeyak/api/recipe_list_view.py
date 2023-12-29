from __future__ import annotations

from collections import namedtuple
from datetime import datetime
from typing import Any, NamedTuple, cast

from django.db import connection
from django.db.backends.utils import CursorWrapper
from pydantic import BaseModel, Field
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.models import (
    get_team,
)
from recipeyak.models.upload import public_url


class RecipeListItemIngredient(BaseModel):
    id: int
    quantity: str
    name: str


class RecipeListItemPrimaryImage(BaseModel):
    id: int
    url: str
    backgroundUrl: str | None = Field(...)


class RecipeListItem(BaseModel):
    id: int
    name: str
    scheduledCount: int
    # This odd syntax is required by pydantic
    # see: https://docs.pydantic.dev/usage/models/#required-optional-fields
    # Until V2 is released:
    # see: https://github.com/pydantic/pydantic/issues/4887
    # see: https://docs.pydantic.dev/blog/pydantic-v2/#required-vs-nullable-cleanup
    author: str | None = Field(...)
    tags: list[str] | None = Field(...)
    ingredients: list[RecipeListItemIngredient]
    archived_at: datetime | None = Field(...)
    primaryImage: RecipeListItemPrimaryImage | None = Field(...)


class ListQueryResult(NamedTuple):
    id: int
    name: str
    author: str
    scheduled_count: int
    archived_at: datetime | None
    tags: list[str]
    ingredients: list[dict[str, Any]] | None
    primary_image: dict[str, Any]


def namedtuplefetchall(cursor: CursorWrapper) -> list[ListQueryResult]:
    """
    Return all rows from a cursor as a namedtuple.
    Assume the column names are unique.
    """
    desc = cursor.description
    if desc is None:
        raise Exception("Description should exist")

    nt_result = namedtuple("Result", [col[0] for col in desc])  # type: ignore[misc]
    return cast(list[ListQueryResult], [nt_result(*row) for row in cursor.fetchall()])


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def recipe_list_view(request: AuthedRequest) -> Response:
    team = get_team(request.user)
    list_items = list[RecipeListItem]()
    with connection.cursor() as cursor:
        cursor.execute(
            """
select
    core_recipe.id,
    core_recipe.name,
    core_recipe.author,
    (
        select count(*)
        from core_scheduledrecipe
        where core_scheduledrecipe.on > (now() - '1.5 years'::interval)
            and core_scheduledrecipe.on < now()
            and core_scheduledrecipe.recipe_id = core_recipe.id
    ) scheduled_count,
    core_recipe.tags,
    core_recipe.archived_at, 
    (
        select json_agg(sub.ingredient) ingredients
        from (
            select json_build_object(
                'id', id,
                'quantity', quantity,
                'name', name
            ) ingredient
            from core_ingredient
            where recipe_id = core_recipe.id
        ) sub
    ) ingredients,
    (
        select
            json_build_object(
                'id', id,
                'key', key,
                'background_url', background_url
            ) primary_image
        from
            core_upload
        where core_upload.recipe_id = core_recipe.id
            and core_upload.id = core_recipe.primary_image_id
        limit 1
    ) primary_image
from core_recipe
where core_recipe.team_id = %(team_id)s
            """,
            {
                "team_id": team.id,
            },
        )
        recipes = namedtuplefetchall(cursor)
    for recipe in recipes:
        ingredients = list[RecipeListItemIngredient]()
        for ingre in recipe.ingredients or []:
            ingredients.append(
                RecipeListItemIngredient(
                    id=ingre["id"], quantity=ingre["quantity"], name=ingre["name"]
                )
            )

        primary_image = (
            RecipeListItemPrimaryImage(
                id=recipe.primary_image["id"],
                url=public_url(recipe.primary_image["key"]),
                backgroundUrl=recipe.primary_image["background_url"],
            )
            if recipe.primary_image
            else None
        )

        list_items.append(
            RecipeListItem(
                id=recipe.id,
                name=recipe.name,
                author=recipe.author,
                tags=recipe.tags,
                ingredients=ingredients,
                archived_at=recipe.archived_at,
                primaryImage=primary_image,
                scheduledCount=recipe.scheduled_count,
            )
        )

    return Response(list_items)
