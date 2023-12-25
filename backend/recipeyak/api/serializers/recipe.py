from __future__ import annotations

from collections.abc import Iterable
from datetime import UTC, date, datetime, timedelta
from typing import Literal, cast

import pydantic
import tldextract

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
            id=attachment.pk,
            url=attachment.public_url(),
            backgroundUrl=attachment.background_url,
            isPrimary=attachment.pk == primary_image_id,
            contentType=attachment.content_type,
        )
        for attachment in attachments
    ]


class ReactionResponse(pydantic.BaseModel):
    id: str
    type: Literal["❤️", "😆", "🤮"]
    note_id: int
    user: PublicUser
    created: datetime


class NoteResponse(pydantic.BaseModel):
    id: str
    text: str
    created_by: PublicUser
    last_modified_by: PublicUser | None
    created: datetime
    modified: datetime
    attachments: list[NoteAttachment]
    reactions: list[ReactionResponse]
    type: Literal["note"] = "note"


def serialize_public_user(user: User) -> PublicUser:
    return PublicUser(
        id=user.id,
        name=user.name or user.email,
        email=user.email,
        avatar_url=user.avatar_url,
    )


def serialize_reactions(reactions: Iterable[Reaction]) -> list[ReactionResponse]:
    return [
        ReactionResponse(
            id=reaction.pk,
            type=cast(Literal["❤️", "😆", "🤮"], reaction.emoji),
            note_id=reaction.note_id,
            user=serialize_public_user(reaction.created_by),
            created=reaction.created,
        )
        for reaction in reactions
    ]


def serialize_note(note: Note, primary_image_id: int) -> NoteResponse:
    return NoteResponse(
        id=str(note.id),
        text=note.text,
        created_by=serialize_public_user(note.created_by),
        last_modified_by=serialize_public_user(note.last_modified_by)
        if note.last_modified_by
        else None,
        created=note.created,
        reactions=serialize_reactions(note.reactions.all()),
        attachments=serialize_attachments(
            note.uploads.all(), primary_image_id=primary_image_id
        ),
        modified=note.modified,
    )


class IngredientResponse(pydantic.BaseModel):
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


def serialize_ingredient(ingredient: Ingredient) -> IngredientResponse:
    return IngredientResponse(
        id=ingredient.pk,
        quantity=ingredient.quantity,
        name=ingredient.name,
        description=ingredient.description,
        position=ingredient.position,
        optional=ingredient.optional,
    )


class StepResponse(pydantic.BaseModel):
    id: int
    text: str
    position: str


def serialize_step(step: Step) -> StepResponse:
    return StepResponse(
        id=step.pk,
        text=step.text,
        position=step.position,
    )


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


class SectionResponse(pydantic.BaseModel):
    id: int
    title: str
    position: str


class RecipeResponse(pydantic.BaseModel):
    id: int
    name: str
    author: str | None
    source: str | None
    time: str | None
    ingredients: list[IngredientResponse]
    steps: list[StepResponse]
    recentSchedules: list[RecentScheduleResponse]
    timelineItems: list[NoteResponse | TimelineEventResponse]
    sections: list[SectionResponse]
    servings: str | None
    modified: datetime
    created: datetime
    # TODO: why dupe?
    archived_at: datetime | None
    tags: list[str] | None
    primaryImage: UploadResponse | None
    archivedAt: datetime | None


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
) -> list[NoteResponse | TimelineEventResponse]:
    items: list[NoteResponse | TimelineEventResponse] = [
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


def serialize_section(section: Section) -> SectionResponse:
    return SectionResponse(
        id=section.id, title=section.title, position=section.position
    )


def serialize_recipe(recipe: Recipe) -> RecipeResponse:
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
    return RecipeResponse(
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
    )
