from datetime import date

import pydantic
from django.db import connection
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.unwrap import unwrap
from recipeyak.models.note import Note
from recipeyak.models.scheduled_recipe import ScheduledRecipe
from recipeyak.models.upload import Upload
from recipeyak.models.user import User


class UserDetailByIdStats(pydantic.BaseModel):
    recipesAdd: int
    recipesArchived: int
    scheduled: int
    comments: int
    photos: int
    primaryPhotos: int


class UserDetailByIdResponse(pydantic.BaseModel):
    id: int
    name: str | None
    email: str
    avatar_url: str
    created: date
    stats: UserDetailByIdStats


def get_recipes_added_count(*, user_id: str) -> int:
    with connection.cursor() as cursor:
        cursor.execute(
            """
SELECT
    count(distinct recipe_id) as "total"
FROM
	timeline_event
	JOIN core_recipe ON core_recipe.id = timeline_event.recipe_id
WHERE
	action = 'created'
	AND created_by_id = %(user_id)s;
""",
            {"user_id": user_id},
        )
        (total,) = unwrap(cursor.fetchone())
    return total  # type: ignore[no-any-return]


def get_recipes_archived_count(*, user_id: str) -> int:
    with connection.cursor() as cursor:
        cursor.execute(
            """
WITH ranked_events AS (
    SELECT
        recipe_id,
        action,
        created,
        ROW_NUMBER() OVER (PARTITION BY recipe_id ORDER BY created DESC) AS rn
    FROM
        timeline_event
    WHERE
        action IN ('archived', 'unarchived')
        and created_by_id = %(user_id)s 
)
select count(*) as "total archived recipes" 
FROM
    ranked_events
WHERE
    rn = 1
    and action = 'archived'
""",
            {"user_id": user_id},
        )
        (archived_recipes_count,) = unwrap(cursor.fetchone())
    return archived_recipes_count  # type: ignore[no-any-return]


def get_comments_count(*, user_id: str) -> int:
    return Note.objects.filter(
        created_by_id=user_id, recipe__archived_at__isnull=True
    ).count()


def get_photos_count(*, user_id: str) -> int:
    return Upload.objects.filter(created_by_id=user_id).count()


def get_primary_photos_count(*, user_id: str) -> int:
    with connection.cursor() as cursor:
        cursor.execute(
            """
SELECT
	count(*) as "primary_images_count"
FROM
	core_recipe
	JOIN core_upload ON core_upload.recipe_id = core_recipe.id
		AND core_recipe.primary_image_id = core_upload.id
WHERE
	core_upload.created_by_id = %(user_id)s
""",
            {"user_id": user_id},
        )
        (primary_images_count,) = unwrap(cursor.fetchone())
    return primary_images_count  # type: ignore[no-any-return]


def get_scheduled_count(*, user_id: str) -> int:
    return ScheduledRecipe.objects.filter(user_id=user_id).count()


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_detail_by_id_view(request: AuthedRequest, user_id: str) -> Response:
    user = get_object_or_404(User, id=user_id)
    recipes_added_count = get_recipes_added_count(user_id=user_id)
    recipes_archived_count = get_recipes_archived_count(user_id=user_id)
    comments_count = get_comments_count(user_id=user_id)
    scheduled_count = get_scheduled_count(user_id=user_id)
    photos_count = get_photos_count(user_id=user_id)
    primary_photos_count = get_primary_photos_count(user_id=user_id)
    return Response(
        UserDetailByIdResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            avatar_url=user.avatar_url,
            created=user.created,
            stats=UserDetailByIdStats(
                recipesAdd=recipes_added_count,
                recipesArchived=recipes_archived_count,
                comments=comments_count,
                scheduled=scheduled_count,
                photos=photos_count,
                primaryPhotos=primary_photos_count,
            ),
        )
    )
