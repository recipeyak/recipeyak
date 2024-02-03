from __future__ import annotations

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.models import filter_notes, get_team


@endpoint()
def note_delete_view(
    request: AuthedHttpRequest[None], note_id: str
) -> JsonResponse[None]:
    team = get_team(request.user)
    filter_notes(team=team).filter(pk=note_id, created_by=request.user).delete()
    return JsonResponse(None, status=204)
