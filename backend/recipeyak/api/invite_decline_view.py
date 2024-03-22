import pydantic
from django.shortcuts import get_object_or_404

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.api.base.serialization import Params
from recipeyak.models.invite import Invite


class InviteDeclineResponse(pydantic.BaseModel):
    detail: str


class InviteDeclineParams(Params):
    invite_id: int


@endpoint()
def invite_decline_view(
    request: AuthedHttpRequest, params: InviteDeclineParams
) -> JsonResponse[InviteDeclineResponse]:
    invite = get_object_or_404(
        Invite.objects.filter(membership__user=request.user), id=params.invite_id
    )
    invite.decline()
    return JsonResponse(InviteDeclineResponse(detail="declined invite"), status=200)
