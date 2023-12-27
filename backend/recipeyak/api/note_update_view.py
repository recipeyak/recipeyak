from __future__ import annotations

from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.base.serialization import RequestParams
from recipeyak.api.serializers.recipe import serialize_note
from recipeyak.models import Upload, filter_notes, get_team


class EditNoteParams(RequestParams):
    text: str | None = None
    attachment_upload_ids: list[str] | None = None


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def note_update_view(request: AuthedRequest, note_id: str) -> Response:
    params = EditNoteParams.parse_obj(request.data)
    team = get_team(request)
    note = get_object_or_404(filter_notes(team=team), pk=note_id)
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
