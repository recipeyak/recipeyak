from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.permissions import IsTeamMember
from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.calendar_list_view import get_cal_settings
from recipeyak.models import Membership, get_random_ical_id


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsTeamMember])
def generate_link(request: AuthedRequest, team_pk: int) -> Response:
    membership = get_object_or_404(Membership, team=team_pk, user=request.user)
    membership.calendar_secret_key = get_random_ical_id()
    membership.save()

    return Response(get_cal_settings(request=request, team_pk=team_pk))
