from __future__ import annotations

from django.shortcuts import get_object_or_404
from pydantic import root_validator
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.base.serialization import RequestParams
from recipeyak.api.serializers.recipe import serialize_note
from recipeyak.models import Note, Upload, filter_recipes, get_team


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


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def note_create_view(request: AuthedRequest, recipe_id: int) -> Response:
    team = get_team(request.user)
    recipe = get_object_or_404(filter_recipes(team=team), pk=recipe_id)
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
        status=201,
    )
