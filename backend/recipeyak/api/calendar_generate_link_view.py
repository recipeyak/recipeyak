from recipeyak.api.base.request import AuthedRequest
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from django.shortcuts import get_object_or_404

from recipeyak.api.base.permissions import IsTeamMember
from recipeyak.models import get_random_ical_id

from recipeyak.models import Membership

from recipeyak.api.calendar_list_view import get_cal_settings


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsTeamMember])
def generate_link(request: AuthedRequest, team_pk: str) -> Response:
    membership = get_object_or_404(Membership, team=team_pk, user=request.user)
    membership.calendar_secret_key = get_random_ical_id()
    membership.save()

    return Response(get_cal_settings(request=request, team_pk=team_pk))
