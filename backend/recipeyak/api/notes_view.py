from __future__ import annotations

from django.db import transaction
from django.shortcuts import get_object_or_404
from pydantic import root_validator
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.base.serialization import RequestParams
from recipeyak.api.serializers.recipe import serialize_note
from recipeyak.models import Note, Upload, get_team, filter_notes, filter_recipes


class CreateNoteParams(RequestParams):
    text: str
    attachment_upload_ids: list[str]

    @root_validator
    def validate_text(
        cls, values: dict[str, str | list[str]]
    ) -> dict[str, str | list[str]]:
        if len(values["text"]) < 0 and len(values["attachment_upload_ids"]) < 0:
            raise ValueError("non-empty note required")
        return values


class EditNoteParams(RequestParams):
    text: str | None = None
    attachment_upload_ids: list[str] | None = None


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def note_create_view(request: AuthedRequest, recipe_pk: int) -> Response:
    team = get_team(request)
    recipe = get_object_or_404(filter_recipes(team=team), pk=recipe_pk)
    params = CreateNoteParams.parse_obj(request.data)

    note = Note.objects.create(
        text=params.text,
        created_by=request.user,
        last_modified_by=request.user,
        recipe=recipe,
    )
    Upload.objects.filter(
        id__in=params.attachment_upload_ids, created_by=request.user
    ).update(note=note)

    return Response(
        serialize_note(note, primary_image_id=recipe.primary_image_id),
        status=status.HTTP_201_CREATED,
    )


@api_view(["DELETE", "PATCH"])
@permission_classes([IsAuthenticated])
def note_detail_view(request: AuthedRequest, note_pk: str) -> Response:
    if request.method == "PATCH":
        return note_patch_view(request, note_pk)
    if request.method == "DELETE":
        return note_delete_view(request, note_pk)
    raise MethodNotAllowed(request.method or "")


def note_patch_view(request: AuthedRequest, note_pk: str) -> Response:
    params = EditNoteParams.parse_obj(request.data)
    team = get_team(request)
    note = get_object_or_404(filter_notes(team), pk=note_pk)
    # only allow the note's author to update the note
    if note.created_by.id != request.user.id:
        return Response(status=status.HTTP_403_FORBIDDEN)
    note.last_modified_by = request.user
    if params.text is not None:
        note.text = params.text
    if params.attachment_upload_ids is not None:
        with transaction.atomic():
            Upload.objects.filter(note=note).update(note=None)
            Upload.objects.filter(
                id__in=params.attachment_upload_ids, created_by=request.user
            ).update(note=note)
    note.save()

    return Response(serialize_note(note, primary_image_id=note.recipe.primary_image_id))


def note_delete_view(request: AuthedRequest, note_pk: str) -> Response:
    team = get_team(request)
    filter_notes(team).filter(pk=note_pk, created_by=request.user).delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
