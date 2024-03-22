from __future__ import annotations

from django.shortcuts import get_object_or_404
from pydantic import model_validator

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.api.base.serialization import Params
from recipeyak.api.serializers.recipe import NoteSerializer, serialize_note
from recipeyak.models import Note, Upload, filter_recipes, get_team
from recipeyak.realtime import publish_recipe


class NoteCreateParams(Params):
    text: str
    attachment_upload_ids: list[str]
    recipe_id: int

    @model_validator(mode="after")
    def validate_non_empty(self) -> NoteCreateParams:
        if len(self.text) < 0 and len(self.attachment_upload_ids) < 0:
            raise ValueError("non-empty note required")
        return self


@endpoint()
def note_create_view(
    request: AuthedHttpRequest, params: NoteCreateParams
) -> JsonResponse[NoteSerializer]:
    team = get_team(request.user)
    recipe = get_object_or_404(filter_recipes(team=team), pk=params.recipe_id)

    note = Note.objects.create(
        text=params.text,
        created_by=request.user,
        last_modified_by=request.user,
        recipe=recipe,
    )
    Upload.objects.filter(
        id__in=params.attachment_upload_ids, created_by=request.user
    ).update(note=note)

    publish_recipe(recipe_id=recipe.id, team_id=team.id)

    return JsonResponse(
        serialize_note(note, primary_image_id=recipe.primary_image_id),
        status=201,
    )
