import pydantic
from django.shortcuts import get_object_or_404

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.models.invite import Invite


class InviteAcceptResponse(pydantic.BaseModel):
    detail: str


@endpoint()
def invite_decline_view(
    request: AuthedHttpRequest[None], invite_id: int
) -> JsonResponse[InviteAcceptResponse]:
    invite = get_object_or_404(
        Invite.objects.filter(membership__user=request.user), id=invite_id
    )
    invite.decline()
    return JsonResponse(InviteAcceptResponse(detail="declined invite"), status=200)
