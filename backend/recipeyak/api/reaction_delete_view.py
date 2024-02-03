from __future__ import annotations

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.models import user_reactions


@endpoint()
def reaction_delete_view(
    request: AuthedHttpRequest[None], reaction_id: int
) -> JsonResponse[None]:
    user_reactions(user=request.user).filter(pk=reaction_id).delete()
    return JsonResponse(None, status=204)
