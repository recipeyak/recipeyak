from django.shortcuts import get_object_or_404

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.models.invite import Invite


@endpoint()
def invite_accept_view(request: AuthedHttpRequest, invite_id: int) -> JsonResponse:
    invite = get_object_or_404(
        Invite.objects.filter(membership__user=request.user), id=invite_id
    )
    invite.accept()
    return JsonResponse({"detail": "accepted invite"}, status=200)
