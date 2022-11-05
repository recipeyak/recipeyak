from __future__ import annotations

from datetime import datetime
from typing import Any, Iterable, List, Optional, cast

import pydantic
from rest_framework import serializers
from typing_extensions import Literal

from core.api.serialization import BaseModelSerializer, BaseRelatedField, BaseSerializer
from core.models import (
    Ingredient,
    Note,
    Recipe,
    ScheduledRecipe,
    Section,
    Step,
    Team,
    User,
)
from core.models.reaction import Reaction
from core.models.upload import Upload
from core.teams.serializers import PublicUserSerializer


class OwnerRelatedField(BaseRelatedField):
    """
    A custom field to use for the `owner` generic relationship.
    """

    def to_representation(self, value):
        if isinstance(value, Team):
            if self.export:
                return {"team": value.name}
            return {"id": value.id, "type": "team", "name": value.name}
        if isinstance(value, User):
            if self.export:
                return {"user": value.email}
            return {"id": value.id, "type": "user"}
        raise Exception("Unexpected type of owner object")

    def __init__(self, *args, **kwargs):
        export = kwargs.pop("export", None)
        super().__init__(*args, **kwargs)
        self.export = export


class IngredientSerializer(BaseModelSerializer):
    """
    serializer the ingredient of a recipe
    """

    class Meta:
        model = Ingredient
        fields = ("id", "quantity", "name", "description", "position", "optional")

    def __init__(self, *args, **kwargs):
        # Don't pass the 'fields' arg up to the superclass
        fields = kwargs.pop("fields", None)

        super().__init__(*args, **kwargs)

        if fields is not None:
            # Drop any fields that are not specified in the `fields` argument.
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)


class StepSerializer(BaseModelSerializer):
    """
    serializer the step of a recipe
    """

    class Meta:
        model = Step
        fields = ("id", "text", "position")

    def __init__(self, *args, **kwargs):
        # Don't pass the 'fields' arg up to the superclass
        fields = kwargs.pop("fields", None)

        super().__init__(*args, **kwargs)

        if fields is not None:
            # Drop any fields that are not specified in the `fields` argument.
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)


class SectionSerializer(BaseModelSerializer):
    position = serializers.CharField(required=False)

    class Meta:
        model = Section
        read_only_fields = ("id",)
        fields = (*read_only_fields, "position", "title")


class RecipeSerializer(BaseModelSerializer):
    steps = StepSerializer(many=True, source="step_set")
    last_scheduled = serializers.DateField(source="get_last_scheduled", read_only=True)
    ingredients = IngredientSerializer(many=True, source="ingredient_set")
    timelineItems = serializers.SerializerMethodField(read_only=True)
    sections = SectionSerializer(many=True, source="section_set", read_only=True)
    owner = OwnerRelatedField(read_only=True)
    # specify default None so we can use this as an optional field
    team = serializers.IntegerField(write_only=True, default=None)

    def get_timelineItems(self, obj: Recipe) -> list[dict[str, Any]]:
        items: list[dict[str, Any]] = [
            serialize_note(x).dict() for x in cast(Any, obj).notes.all()
        ]

        items += [
            dict(
                type="recipe",
                id=x.id,
                action=x.action,
                created_by=PublicUserSerializer(x.created_by).data
                if x.created_by
                else None,
                created=x.created,
            )
            for x in cast(Any, obj).timelineevent_set.all()
        ]

        return items

    class Meta:
        model = Recipe
        fields = (
            "id",
            "name",
            "author",
            "source",
            "time",
            "ingredients",
            "steps",
            "timelineItems",
            "sections",
            "servings",
            "modified",
            "owner",
            "team",
            "last_scheduled",
            "created",
            "archived_at",
            "tags",
        )
        read_only_fields = ("owner", "last_scheduled")

    def __init__(self, *args, **kwargs):
        # Don't pass the 'fields' arg up to the superclass
        fields = kwargs.pop("fields", None)

        super().__init__(*args, **kwargs)

        if fields is not None:
            # Drop any fields that are not specified in the `fields` argument.
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)


class RecipeMoveCopySerializer(BaseSerializer):
    id = serializers.IntegerField(max_value=None, min_value=0, write_only=True)
    type = serializers.ChoiceField(choices=["user", "team"], write_only=True)

    def validate(self, data):
        if data["type"] == "team" and not Team.objects.filter(id=data["id"]).exists():
            raise serializers.ValidationError("team must exist")
        if data["type"] == "user" and not User.objects.filter(id=data["id"]).exists():
            raise serializers.ValidationError("user must exist")
        return data


class RecipeTimelineSerializer(BaseModelSerializer):
    class Meta:
        model = ScheduledRecipe
        fields = ("id", "on")


class PublicUser(pydantic.BaseModel):
    id: int
    name: str
    email: str
    avatar_url: str


class NoteAttachment(pydantic.BaseModel):
    id: str
    url: str
    type: Literal["upload"] = "upload"


def serialize_attachments(attachments: Iterable[Upload]) -> Iterable[NoteAttachment]:
    for attachment in attachments:
        yield NoteAttachment(id=attachment.pk, url=attachment.public_url())


class ReactionResponse(pydantic.BaseModel):
    id: str
    type: Literal["❤️", "😆", "🤮"]
    note_id: str
    user: PublicUser
    created: datetime


class NoteResponse(pydantic.BaseModel):
    id: int
    text: str
    created_by: PublicUser
    last_modified_by: Optional[PublicUser]
    created: datetime
    modified: datetime
    attachments: List[NoteAttachment]
    reactions: List[ReactionResponse]
    type: Literal["note"] = "note"


def serialize_public_user(user: User) -> PublicUser:
    return PublicUser(
        id=user.id,
        name=user.name or user.email,
        email=user.email,
        avatar_url=user.avatar_url,
    )


def serialize_reactions(reactions: Iterable[Reaction]) -> List[ReactionResponse]:
    return [
        ReactionResponse(
            id=reaction.pk,
            type=reaction.emoji,
            note_id=reaction.note_id,
            user=serialize_public_user(reaction.created_by),
            created=reaction.created,
        )
        for reaction in reactions
    ]


def serialize_note(note: Note) -> NoteResponse:
    return NoteResponse(
        id=note.pk,
        text=note.text,
        created_by=serialize_public_user(note.created_by),
        last_modified_by=serialize_public_user(note.last_modified_by)
        if note.last_modified_by
        else None,
        created=note.created,
        reactions=serialize_reactions(note.reactions.all()),
        attachments=serialize_attachments(note.uploads.all()),
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
