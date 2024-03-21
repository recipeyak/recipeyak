import pydantic
from django.shortcuts import get_object_or_404

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.api.base.serialization import RequestParams
from recipeyak.models.invite import Invite


class InviteAcceptResponse(pydantic.BaseModel):
    detail: str


class InviteAcceptParams(RequestParams):
    invite_id: int


@endpoint()
def invite_accept_view(
    request: AuthedHttpRequest, params: InviteAcceptParams
) -> JsonResponse[InviteAcceptResponse]:
    invite = get_object_or_404(
        Invite.objects.filter(membership__user=request.user), id=params.invite_id
    )
    invite.accept()
    return JsonResponse(InviteAcceptResponse(detail="accepted invite"), status=200)
