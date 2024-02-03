from __future__ import annotations

from datetime import datetime

import pydantic

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.models import filter_recipes, get_team
from recipeyak.models.user import get_avatar_url


class PrimaryImageResponse(pydantic.BaseModel):
    id: int
    url: str
    backgroundUrl: str | None


class CreatedByResponse(pydantic.BaseModel):
    id: int
    name: str
    avatarUrl: str


class RecipeRecentlyCreatedViewResponse(pydantic.BaseModel):
    id: int
    name: str
    author: str | None
    archivedAt: datetime | None
    primaryImage: PrimaryImageResponse | None
    createdBy: CreatedByResponse | None


@endpoint()
def recipe_recently_created_view(
    request: AuthedHttpRequest[None]
) -> JsonResponse[list[RecipeRecentlyCreatedViewResponse]]:
    team = get_team(request.user)
    recipes = list[RecipeRecentlyCreatedViewResponse]()
    for r in filter_recipes(team=team).order_by("-created")[:6]:
        # A little hacky to appease Django ORM's prefetch related caching logic
        create_event = next(
            (x for x in r.timelineevent_set.all() if x.created_by is not None), None
        )
        if create_event is not None and create_event.created_by is not None:
            created_by = CreatedByResponse(
                id=create_event.created_by.id,
                name=create_event.created_by.name or create_event.created_by.email,
                avatarUrl=get_avatar_url(
                    email=create_event.created_by.email,
                    profile_upload_key=create_event.created_by.profile_upload.key
                    if create_event.created_by.profile_upload is not None
                    else None,
                ),
            )
        else:
            created_by = None
        primary_image = (
            PrimaryImageResponse(
                id=r.primary_image.id,
                url=r.primary_image.public_url(),
                backgroundUrl=r.primary_image.background_url,
            )
            if r.primary_image is not None
            else None
        )
        recipes.append(
            RecipeRecentlyCreatedViewResponse(
                id=r.id,
                name=r.name,
                author=r.author,
                archivedAt=r.archived_at,
                primaryImage=primary_image,
                createdBy=created_by,
            )
        )
    return JsonResponse(recipes)
