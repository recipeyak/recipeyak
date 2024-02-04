from django.shortcuts import get_object_or_404

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.api.calendar_list_view import CalSettings, get_cal_settings
from recipeyak.models import Membership, get_random_ical_id, get_team


@endpoint()
def calendar_generate_link_view(
    request: AuthedHttpRequest[None]
) -> JsonResponse[CalSettings]:
    team_id = get_team(request.user).id
    membership = get_object_or_404(Membership, team=team_id, user=request.user)
    membership.calendar_secret_key = get_random_ical_id()
    membership.save()

    return JsonResponse(get_cal_settings(request=request, team_id=team_id))
