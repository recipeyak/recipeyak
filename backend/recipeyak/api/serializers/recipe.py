from __future__ import annotations

from collections.abc import Iterable
from datetime import UTC, date, datetime, timedelta
from typing import Literal, cast

import pydantic
import tldextract
from django.db import connection

from recipeyak.models import (
    Ingredient,
    Note,
    Recipe,
    Section,
    Step,
    User,
)
from recipeyak.models.reaction import Reaction
from recipeyak.models.timeline_event import TimelineEvent
from recipeyak.models.upload import Upload
from recipeyak.models.user import get_avatar_url

IGNORED_TIMELINE_EVENTS = {"set_primary_image", "remove_primary_image"}


class PublicUser(pydantic.BaseModel):
    id: int
    name: str
    email: str
    avatar_url: str


class NoteAttachment(pydantic.BaseModel):
    id: str
    url: str
    backgroundUrl: str | None
    contentType: str
    isPrimary: bool
    type: Literal["upload"] = "upload"


def serialize_attachments(
    attachments: Iterable[Upload], primary_image_id: int | None
) -> list[NoteAttachment]:
    return [
        NoteAttachment(
            id=str(attachment.pk),
            url=attachment.public_url(),
            backgroundUrl=attachment.background_url,
            isPrimary=attachment.pk == primary_image_id,
            contentType=attachment.content_type,
        )
        for attachment in attachments
    ]


class ReactionSerializer(pydantic.BaseModel):
    id: str
    type: Literal["❤️", "😆", "🤮"]
    note_id: int
    user: PublicUser
    created: datetime


class NoteSerializer(pydantic.BaseModel):
    id: str
    text: str
    created_by: PublicUser
    created: datetime
    modified: datetime
    attachments: list[NoteAttachment]
    reactions: list[ReactionSerializer]
    type: Literal["note"] = "note"


def serialize_public_user(user: User) -> PublicUser:
    return PublicUser(
        id=user.id,
        name=user.name or user.email,
        email=user.email,
        avatar_url=get_avatar_url(
            email=user.email,
            profile_upload_key=user.profile_upload.key
            if user.profile_upload is not None
            else None,
        ),
    )


def serialize_reactions(reactions: Iterable[Reaction]) -> list[ReactionSerializer]:
    return [
        ReactionSerializer(
            id=str(reaction.id),
            type=cast(Literal["❤️", "😆", "🤮"], reaction.emoji),
            note_id=reaction.note_id,
            user=serialize_public_user(reaction.created_by),
            created=reaction.created,
        )
        for reaction in reactions
    ]


def serialize_note(note: Note, primary_image_id: int) -> NoteSerializer:
    return NoteSerializer(
        id=str(note.id),
        text=note.text,
        created_by=serialize_public_user(note.created_by),
        created=note.created,
        reactions=serialize_reactions(note.reactions.all()),
        attachments=serialize_attachments(
            note.uploads.all(), primary_image_id=primary_image_id
        ),
        modified=note.modified,
    )


class IngredientSerializer(pydantic.BaseModel):
    id: int
    quantity: str
    name: str
    description: str
    position: str
    optional: bool


def ingredient_to_text(ingredient: Ingredient) -> str:
    text = f"{ingredient.quantity} {ingredient.name}"

    if ingredient.description:
        text += f", {ingredient.description}"

    if ingredient.optional:
        text += " [optional]"

    return text


def serialize_ingredient(ingredient: Ingredient) -> IngredientSerializer:
    return IngredientSerializer(
        id=ingredient.pk,
        quantity=ingredient.quantity,
        name=ingredient.name,
        description=ingredient.description,
        position=ingredient.position,
        optional=ingredient.optional,
    )


class StepSerializer(pydantic.BaseModel):
    id: int
    text: str
    position: str


def serialize_step(step: Step) -> StepSerializer:
    return StepSerializer(
        id=step.pk,
        text=step.text,
        position=step.position,
    )


class IngredientVersionResponse(pydantic.BaseModel):
    id: int | None
    type: Literal["ingredient"]
    description: str
    quantity: str
    name: str
    position: str
    optional: bool


class SectionVersionResponse(pydantic.BaseModel):
    id: int | None
    type: Literal["section"]
    title: str
    position: str


class StepVersionResponse(pydantic.BaseModel):
    id: int | None
    text: str
    position: str


class PrimaryImageResponse(pydantic.BaseModel):
    id: int
    url: str
    backgroundUrl: str | None


class RecipeVersionActorResponse(pydantic.BaseModel):
    id: int
    name: str
    avatar_url: str


class RecipeVersionResponse(pydantic.BaseModel):
    id: int
    created_at: str
    actor: RecipeVersionActorResponse | None
    name: str
    author: str | None
    source: str | None
    time: str | None
    servings: str | None
    archived_at: str | None
    tags: list[str] | None
    primary_image: PrimaryImageResponse | None
    ingredients: list[IngredientVersionResponse | SectionVersionResponse]
    steps: list[StepVersionResponse]


class TimelineEventResponse(pydantic.BaseModel):
    id: int
    type: Literal["recipe"]
    action: Literal[
        "created",
        "archived",
        "unarchived",
        "deleted",
        "scheduled",
        "remove_primary_image",
        "set_primary_image",
    ]
    created_by: PublicUser | None
    is_scraped: bool
    created: datetime


class UploadResponse(pydantic.BaseModel):
    id: str
    url: str
    backgroundUrl: str | None
    contentType: str
    author: str | None


class RecentScheduleResponse(pydantic.BaseModel):
    id: int
    on: date


class SectionSerializer(pydantic.BaseModel):
    id: int
    title: str
    position: str


class RecipeSerializer(pydantic.BaseModel):
    id: int
    name: str
    author: str | None
    source: str | None
    time: str | None
    servings: str | None
    ingredients: list[IngredientSerializer]
    steps: list[StepSerializer]
    recentSchedules: list[RecentScheduleResponse]
    timelineItems: list[NoteSerializer | TimelineEventResponse]
    sections: list[SectionSerializer]
    modified: datetime
    created: datetime
    archived_at: datetime | None
    tags: list[str] | None
    primaryImage: UploadResponse | None
    versions: list[RecipeVersionResponse]


def serialize_timeline_event(
    timeline_event: TimelineEvent, recipe: Recipe
) -> TimelineEventResponse:
    created_by = (
        serialize_public_user(timeline_event.created_by)
        if timeline_event.created_by
        else None
    )
    return TimelineEventResponse(
        type="recipe",
        id=timeline_event.id,
        action=cast(
            Literal[
                "created",
                "archived",
                "unarchived",
                "deleted",
                "scheduled",
                "remove_primary_image",
                "set_primary_image",
            ],
            timeline_event.action,
        ),
        created_by=created_by,
        is_scraped=recipe.scrape_id is not None,
        created=timeline_event.created,
    )


def serialize_timeline_items(
    recipe: Recipe
) -> list[NoteSerializer | TimelineEventResponse]:
    items: list[NoteSerializer | TimelineEventResponse] = [
        serialize_note(x, primary_image_id=recipe.primary_image_id)
        for x in recipe.notes.all()
    ]

    items += [
        serialize_timeline_event(x, recipe)
        for x in recipe.timelineevent_set.all()
        if x.action not in IGNORED_TIMELINE_EVENTS
    ]

    return items


def serialize_recent_schedules(recipe: Recipe) -> list[RecentScheduleResponse]:
    now = datetime.now(UTC).date()
    return [
        RecentScheduleResponse(id=s.id, on=s.on)
        for s in recipe.scheduledrecipe_set.all()
        # HACK: we do the filtering in application land so we can use the `prefetch_related` query we already have.
        if now - timedelta(weeks=3) <= s.on <= now + timedelta(weeks=3)
    ]


def serialize_upload(upload: Upload) -> UploadResponse:
    author: str | None = None
    if (
        upload.created_by is None
        and upload.recipe is not None
        and upload.recipe.source is not None
        and upload.recipe.source.startswith("http")
    ):
        # added by scraper
        author = tldextract.extract(upload.recipe.source).domain
    elif upload.created_by is not None:
        # added by user
        author = upload.created_by.name
    return UploadResponse(
        id=str(upload.id),
        url=upload.public_url(),
        backgroundUrl=upload.background_url,
        contentType=upload.content_type,
        author=author,
    )


def serialize_section(section: Section) -> SectionSerializer:
    return SectionSerializer(
        id=section.id, title=section.title, position=section.position
    )


def _get_versions(recipe_id: int) -> list[RecipeVersionResponse]:
    with connection.cursor() as cur:
        cur.execute(
            """
select 
  json_object(
    'id': recipe_historical.id,
    'created_at': recipe_historical.created,
    'actor': (
      select json_object(
        'id': id,
        'name': coalesce(name, email),
        'avatar_url': coalesce(
          (
            select 'https://images-cdn.recipeyak.com/' || key 
            from core_upload
            where core_myuser.profile_upload_id = core_upload.id
          ),
          '/avatar/' || md5(core_myuser.email) || '?d=identicon&r=g'
        )
      )
      from core_myuser
      where core_myuser.id = recipe_historical.actor_id
    ),
    'name': recipe_historical.name, 
    'author': recipe_historical.author,
    'source': recipe_historical.source,
    'time': recipe_historical.time,
    'servings': recipe_historical.servings,
    'archived_at': recipe_historical.archived_at,
    'tags': recipe_historical.tags,
    'primary_image': (
      select json_object(
        'id': core_upload.id,
        'url': 'https://images-cdn.recipeyak.com/' || key,
        'backgroundUrl': background_url
      )
      from core_upload
      where core_upload.id = recipe_historical.primary_image_id
    ),
    'ingredients': (
      select coalesce(json_agg(ingredient), '[]'::json)
      from (
        select ingredient 
        from (  
          select
            json_object(
              'id': ingredient_id,
              'type': 'ingredient',
              'description': description,
              'quantity': quantity,
              'name': name,
              'position': position,
              'optional': optional
            ) as ingredient
          from
            ingredient_historical
          where
            ingredient_historical.recipe_historical_id = recipe_historical.id
          union all (
            select
              json_object(
               'id': section_id,
               'type': 'section',
               'title': title,
               'position': position
             ) AS ingredient
           from
            section_historical
           where
            section_historical.recipe_historical_id = recipe_historical.id
          )
       )
      order by 
        (ingredient->'position')::text asc
      ) sub
    ),
    'steps': (
      select coalesce(json_agg(step), '[]'::json)
      from (
        select
          json_object(
            'id': step_id,
            'text': text,
            'position': position
          ) AS step
        from
          step_historical
        where
          step_historical.recipe_historical_id = recipe_historical.id
        order by
          position asc
      ) sub
  )
)
from recipe_historical 
join core_recipe on core_recipe.id = recipe_historical.recipe_id
where core_recipe.id = %(recipe_id)s
order by recipe_historical.created desc
""",
            {"recipe_id": recipe_id},
        )
        out: list[RecipeVersionResponse] = []
        for row in cur.fetchall():
            obj = row[0]
            out.append(
                RecipeVersionResponse.model_validate(
                    obj,
                )
            )
        return out


def serialize_recipe(recipe: Recipe) -> RecipeSerializer:
    ingredients = [serialize_ingredient(x) for x in recipe.ingredient_set.all()]
    steps = [serialize_step(x) for x in recipe.step_set.all()]
    recent_schedules = serialize_recent_schedules(recipe)
    sections = [serialize_section(x) for x in recipe.section_set.all()]
    timeline_items = serialize_timeline_items(recipe)
    primary_image = (
        serialize_upload(recipe.primary_image)
        if recipe.primary_image is not None
        else None
    )
    versions = _get_versions(recipe.id)
    return RecipeSerializer(
        id=recipe.id,
        name=recipe.name,
        author=recipe.author,
        source=recipe.source,
        time=recipe.time,
        ingredients=ingredients,
        steps=steps,
        recentSchedules=recent_schedules,
        timelineItems=timeline_items,
        sections=sections,
        servings=recipe.servings,
        modified=recipe.modified,
        created=recipe.created,
        archived_at=recipe.archived_at,
        tags=recipe.tags,
        primaryImage=primary_image,
        versions=versions,
    )
