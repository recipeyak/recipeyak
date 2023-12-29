from __future__ import annotations

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.models import user_reactions


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def reaction_delete_view(request: AuthedRequest, reaction_id: int) -> Response:
    user_reactions(user=request.user).filter(pk=reaction_id).delete()
    return Response(status=204)
