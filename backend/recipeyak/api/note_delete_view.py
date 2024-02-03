from __future__ import annotations

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.models import filter_notes, get_team
from recipeyak.realtime import publish_recipe


@endpoint()
def note_delete_view(request: AuthedHttpRequest, note_id: str) -> JsonResponse:
    team = get_team(request.user)
    note = filter_notes(team=team).filter(pk=note_id, created_by=request.user).first()
    if note:
        note.delete()
        publish_recipe(recipe_id=note.recipe_id, team_id=team.id)
    return JsonResponse(status=204)
