from __future__ import annotations

import logging
from typing import Optional, TypeVar

from django.db import connection
from django.shortcuts import get_object_or_404
from rest_framework import serializers
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base import viewsets
from recipeyak.api.base.permissions import IsTeamMember
from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.calendar_list_view import (
    ScheduledRecipeSerializer,
    get_cal_settings,
    get_scheduled_recipes,
)
from recipeyak.models import Membership, get_random_ical_id

logger = logging.getLogger(__name__)

T = TypeVar("T")


def unwrap(arg: Optional[T]) -> T:
    assert arg is not None
    return arg


class CalSettingsSerializer(serializers.Serializer):
    syncEnabled = serializers.BooleanField()


class CalendarViewSet(viewsets.ModelViewSet):
    serializer_class = ScheduledRecipeSerializer
    permission_classes = (IsAuthenticated, IsTeamMember)

    # patch method to update the `on` date uses this
    def get_queryset(self):
        return get_scheduled_recipes(self.request, self.kwargs["team_pk"])

    @action(detail=False, methods=["PATCH"], url_path="settings")
    def update_settings(self, request: AuthedRequest, team_pk: str) -> Response:
        serializer = CalSettingsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        sync_enabled = serializer.validated_data["syncEnabled"]

        membership = get_object_or_404(Membership, team=team_pk, user=request.user)
        membership.calendar_sync_enabled = sync_enabled
        membership.save()

        return Response(get_cal_settings(request=request, team_pk=team_pk))

    @action(detail=False, methods=["POST"])
    def generate_link(self, request: AuthedRequest, team_pk: str) -> Response:
        membership = get_object_or_404(Membership, team=team_pk, user=request.user)
        membership.calendar_secret_key = get_random_ical_id()
        membership.save()

        return Response(get_cal_settings(request=request, team_pk=team_pk))

    @action(detail=False, methods=["GET"])
    def next_open(self, request: AuthedRequest, team_pk: str) -> Response:
        with connection.cursor() as cursor:
            weekday = request.query_params["day"]
            now = request.query_params["now"]
            day_number = {
                "Sunday": (0,),
                "Monday": (1,),
                "Tuesday": (2,),
                "Wednesday": (3,),
                "Thursday": (4,),
                "Friday": (5,),
                "Saturday": (6,),
                "Weekday": (1, 2, 3, 4, 5),
                "Weekend": (0, 6),
            }[weekday]

            cursor.execute(
                """
SELECT
  gen_date::date "date"
FROM
  generate_series(%(now)s::date + '1 day'::interval, (%(now)s::date + '3 years'::interval), '1 day') "gen_date"
  LEFT JOIN core_scheduledrecipe ON core_scheduledrecipe."on" = gen_date
    AND team_id = %(team_id)s
WHERE
  date_part('dow', gen_date) in %(day_number)s
  AND id IS NULL
ORDER BY
  gen_date ASC
LIMIT 1;
""",
                {"day_number": day_number, "team_id": team_pk, "now": now},
            )
            (date,) = unwrap(cursor.fetchone())
            return Response({"date": date})
