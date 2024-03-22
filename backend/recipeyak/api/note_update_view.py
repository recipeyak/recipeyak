from __future__ import annotations

from django.db import transaction
from django.shortcuts import get_object_or_404

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.exceptions import APIError
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.api.base.serialization import Params
from recipeyak.api.serializers.recipe import NoteSerializer, serialize_note
from recipeyak.models import Upload, filter_notes, get_team
from recipeyak.realtime import publish_recipe
from recipeyak.versioning import save_note_version


class NoteUpdateParams(Params):
    text: str | None = None
    attachment_upload_ids: list[str] | None = None
    note_id: str


@endpoint()
def note_update_view(
    request: AuthedHttpRequest, params: NoteUpdateParams
) -> JsonResponse[NoteSerializer]:
    team = get_team(request.user)
    note = get_object_or_404(filter_notes(team=team), pk=params.note_id)
    # only allow the note's author to update the note
    if note.created_by.id != request.user.id:
        raise APIError(
            code="missing_perms",
            message="Only the note's author is allowed to update the note.",
            status=403,
        )
    with transaction.atomic():
        # record the current note state
        save_note_version(note, actor=request.user)

        # mutate the note
        if text := params.text:
            note.text = text
        if upload_ids := params.attachment_upload_ids:
            # 1. clear out previous upload ids
            Upload.objects.filter(note=note).update(note=None)
            # 2. set the new uploads ids
            Upload.objects.filter(id__in=upload_ids, created_by=request.user).update(
                note=note
            )
        note.save()
    publish_recipe(recipe_id=note.recipe_id, team_id=team.id)

    return JsonResponse(
        serialize_note(note, primary_image_id=note.recipe.primary_image_id)
    )
