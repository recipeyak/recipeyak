from __future__ import annotations

from datetime import datetime

import pydantic
from django.db import connection

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.models import get_team


class PrimaryImageResponse(pydantic.BaseModel):
    id: int
    url: str
    backgroundUrl: str | None


class CreatedByResponse(pydantic.BaseModel):
    id: int
    name: str
    avatarUrl: str


class RecipeRecentlyCreatedItem(pydantic.BaseModel):
    id: int
    name: str
    author: str | None
    archivedAt: datetime | None
    primaryImage: PrimaryImageResponse | None
    createdBy: CreatedByResponse | None


@endpoint()
def recipe_recently_created_view(
    request: AuthedHttpRequest, params: None
) -> list[RecipeRecentlyCreatedItem]:
    team = get_team(request.user)
    recipes = list[RecipeRecentlyCreatedItem]()
    with connection.cursor() as cursor:
        cursor.execute(
            """
 select json_object(
    'id': id,
    'name': name,
    'author': author,
    'archivedAt': archived_at,
    'primaryImage':  (
        select json_object(
            'id': core_upload.id,
            'url': 'https://images-cdn.recipeyak.com/' || "key" ,
            'backgroundUrl': "background_url"
        )
        from core_upload
        where core_upload.id = core_recipe.primary_image_id
    ),
    'createdBy': (
        select json_object(
            'id': core_myuser.id,
            'name': COALESCE(core_myuser.name, core_myuser.email),
            'avatarUrl': COALESCE((
                select 'https://images-cdn.recipeyak.com/' || key 
                from core_upload
                where core_myuser.profile_upload_id = core_upload.id
                ),
                '/avatar/' || md5(core_myuser.email) || '?d=identicon&r=g'
            )
        )
        from core_myuser
        join timeline_event on timeline_event.recipe_id = core_recipe.id
            and timeline_event.created_by_id = core_myuser.id
            and timeline_event."action" = 'created'
    )
) recipe
from core_recipe
where team_id = %(team_id)s 
order by created desc
limit 6;
""",
            {"team_id": team.id},
        )
        rows = cursor.fetchall()
        for row in rows:
            recipes.append(RecipeRecentlyCreatedItem.model_validate(row[0]))
    return recipes
