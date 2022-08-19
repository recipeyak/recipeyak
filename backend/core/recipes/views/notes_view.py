from __future__ import annotations

from typing import List, Optional

from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.models import (
    Note,
    Upload,
    user_and_team_notes,
    user_and_team_recipes,
)
from core.recipes.serializers import (
    serialize_note,
)
from core.request import AuthedRequest
from core.serialization import RequestParams


class CreateNoteParams(RequestParams):
    text: str
    attachment_upload_ids: List[str]


class EditNoteParams(RequestParams):
    text: Optional[str] = None
    attachment_upload_ids: Optional[List[str]] = None


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def note_create_view(request: AuthedRequest, recipe_pk: int) -> Response:
    recipe = get_object_or_404(user_and_team_recipes(request.user), pk=recipe_pk)
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

    return Response(serialize_note(note), status=status.HTTP_201_CREATED)


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
    note = get_object_or_404(user_and_team_notes(request.user), pk=note_pk)
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

    return Response(serialize_note(note))


def note_delete_view(request: AuthedRequest, note_pk: str) -> Response:
    user_and_team_notes(request.user).filter(pk=note_pk).delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
