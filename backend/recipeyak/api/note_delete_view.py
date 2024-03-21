from __future__ import annotations

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.api.base.serialization import RequestParams
from recipeyak.models import filter_notes, get_team
from recipeyak.realtime import publish_recipe


class NoteDeleteParams(RequestParams):
    note_id: str


@endpoint()
def note_delete_view(
    request: AuthedHttpRequest, params: NoteDeleteParams
) -> JsonResponse[None]:
    team = get_team(request.user)
    if (
        note := filter_notes(team=team)
        .filter(pk=params.note_id, created_by=request.user)
        .first()
    ):
        note.delete()
        publish_recipe(recipe_id=note.recipe_id, team_id=team.id)
    return JsonResponse(None, status=204)
