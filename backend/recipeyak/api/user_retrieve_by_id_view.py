from datetime import date, datetime

import pydantic
from django.db import connection
from django.http import Http404
from django.shortcuts import get_object_or_404

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.api.unwrap import unwrap
from recipeyak.models.note import Note
from recipeyak.models.scheduled_recipe import ScheduledRecipe
from recipeyak.models.upload import Upload
from recipeyak.models.user import User, get_avatar_url


class UserDetailByIdStats(pydantic.BaseModel):
    recipesAdd: int
    recipesArchived: int
    scheduled: int
    comments: int
    photos: int
    primaryPhotos: int


class Activity(pydantic.BaseModel):
    recipe_id: int
    recipe_name: str
    created_date: date
    created: datetime
    note_id: int
    type: str


class UserDetailByIdResponse(pydantic.BaseModel):
    id: int
    name: str | None
    email: str
    avatar_url: str
    created: date
    stats: UserDetailByIdStats
    activity: list[Activity]


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
    return Upload.objects.filter(created_by_id=user_id, recipe_id__isnull=False).count()


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
    return ScheduledRecipe.objects.filter(created_by_id=user_id).count()


def get_activity(*, user_id: str) -> list[Activity]:
    with connection.cursor() as cursor:
        cursor.execute(
            """
SELECT * FROM (
-- recipes created
SELECT DISTINCT
    recipe_id,
    core_recipe.name,
    core_recipe.created::date as created_date,
    core_recipe.created,
    -1,
    'recipe_create' as type
FROM
    timeline_event
    JOIN core_recipe ON core_recipe.id = timeline_event.recipe_id
WHERE
    action = 'created'
    AND created_by_id = %(user_id)s
UNION
-- comments created
SELECT DISTINCT
    core_note.recipe_id,
    core_recipe.name,
    core_note.created::date as created_date,
    core_note.created,
    core_note.id,
    'comment_create' as type
FROM
    timeline_event
    JOIN core_note ON core_note.recipe_id = timeline_event.recipe_id
    JOIN core_recipe on core_recipe.id = core_note.recipe_id
WHERE
    action = 'created'
    AND core_note.created_by_id = %(user_id)s
UNION
-- recipes archived
SELECT
    t.recipe_id,
    core_recipe.name,
    t.created::date as created_date,
    t.created,
    -1,
    'recipe_archived' as type
FROM (
    SELECT
        te.recipe_id,
        te.created,
        te.action,
        ROW_NUMBER() OVER (PARTITION BY te.recipe_id ORDER BY te.created DESC) AS rn
    FROM
        timeline_event te
    WHERE
        te.action IN ('archived', 'unarchived')
        AND te.created_by_id = %(user_id)s
) AS t
    JOIN core_recipe on core_recipe.id = t.recipe_id
WHERE
    t.rn = 1
    AND t.action = 'archived'
UNION
-- recipes scheduled
SELECT
    core_scheduledrecipe.recipe_id,
    core_recipe.name,
    core_scheduledrecipe.created::date as created_date,
    core_scheduledrecipe.created,
    -1,
    'recipe_scheduled' as type
FROM
    core_scheduledrecipe
    JOIN core_recipe on core_recipe.id = core_scheduledrecipe.recipe_id
WHERE
    created_by_id = %(user_id)s
UNION
-- photo created
SELECT
    core_upload.recipe_id,
    core_recipe.name,
    core_upload.created::date as created_date,
    core_upload.created,
    core_upload.note_id,
    'photo_created' as type
FROM
    core_upload
    JOIN core_recipe on core_recipe.id = core_upload.recipe_id
WHERE
    created_by_id = %(user_id)s
    AND recipe_id IS NOT NULL
UNION
-- photo primary created
SELECT
    core_upload.recipe_id,
    core_recipe.name,
    core_upload.created::date as created_date,
    core_upload.created,
    -1,
    'primary_photo_created' AS TYPE
FROM
    core_recipe
    JOIN core_upload ON core_upload.recipe_id = core_recipe.id
        AND core_recipe.primary_image_id = core_upload.id
WHERE
    core_upload.created_by_id = %(user_id)s
ORDER BY
    3 DESC) as _
WHERE
    created_date >= (now() - '3 months'::interval)::date;
""",
            {"user_id": user_id},
        )
        results = cursor.fetchall()
    out: list[Activity] = []
    for recipe_id, recipe_name, created_date, created, note_id, type in results:
        out.append(
            Activity(
                recipe_id=recipe_id,
                recipe_name=recipe_name,
                created_date=created_date,
                created=created,
                note_id=note_id or -1,
                type=type,
            )
        )
    return out


def has_team_connection(user_a: str | int, user_b: str | int) -> bool:
    with connection.cursor() as cursor:
        cursor.execute(
            """
select 1
from core_membership a
join core_membership b ON b.user_id = %(user_b_id)s
    AND b.team_id = a.team_id
where a.user_id = %(user_a_id)s
""",
            {"user_b_id": user_b, "user_a_id": user_a},
        )
        return cursor.fetchone() is not None


@endpoint()
def user_retrieve_by_id_view(
    request: AuthedHttpRequest[None], user_id: str
) -> JsonResponse[UserDetailByIdResponse]:
    user = get_object_or_404(User, id=user_id)
    if not has_team_connection(user_id, request.user.id):
        raise Http404
    recipes_added_count = get_recipes_added_count(user_id=user_id)
    recipes_archived_count = get_recipes_archived_count(user_id=user_id)
    comments_count = get_comments_count(user_id=user_id)
    scheduled_count = get_scheduled_count(user_id=user_id)
    photos_count = get_photos_count(user_id=user_id)
    primary_photos_count = get_primary_photos_count(user_id=user_id)
    activity = get_activity(user_id=user_id)
    return JsonResponse(
        UserDetailByIdResponse(
            id=user.id,
            name=user.name or user.email,
            email=user.email,
            avatar_url=get_avatar_url(
                email=user.email,
                profile_upload_key=user.profile_upload.key
                if user.profile_upload is not None
                else None,
            ),
            created=user.created,
            stats=UserDetailByIdStats(
                recipesAdd=recipes_added_count,
                recipesArchived=recipes_archived_count,
                comments=comments_count,
                scheduled=scheduled_count,
                photos=photos_count,
                primaryPhotos=primary_photos_count,
            ),
            activity=activity,
        )
    )
