import pydantic
from django.shortcuts import get_object_or_404

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.api.base.serialization import RequestParams
from recipeyak.models.invite import Invite


class InviteAcceptResponse(pydantic.BaseModel):
    detail: str


class InviteDeclineParams(RequestParams):
    invite_id: int


@endpoint()
def invite_decline_view(
    request: AuthedHttpRequest, params: InviteDeclineParams
) -> JsonResponse[InviteAcceptResponse]:
    invite = get_object_or_404(
        Invite.objects.filter(membership__user=request.user), id=params.invite_id
    )
    invite.decline()
    return JsonResponse(InviteAcceptResponse(detail="declined invite"), status=200)
