from __future__ import annotations

import dataclasses
from typing import Any, Dict, cast

from django.utils import timezone
from rest_framework import serializers, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from user_sessions.models import Session

from core import user_agent
from core.api.request import AuthedRequest
from core.api.serialization import BaseModelSerializer


class SessionSerializer(BaseModelSerializer):
    id = serializers.CharField(source="pk")
    device = serializers.SerializerMethodField()
    current = serializers.SerializerMethodField()

    class Meta:
        model = Session
        editable = False
        fields = ("id", "device", "current", "last_activity", "ip")

    def get_device(self, obj: Session) -> Dict[str, Any]:
        ua = obj.user_agent
        assert ua is not None
        return dataclasses.asdict(user_agent.parse(ua))

    def get_current(self, obj: Session) -> bool:
        return cast(bool, obj.pk == self.context["request"].session.session_key)


@api_view(["GET", "DELETE"])
@permission_classes([IsAuthenticated])
def sessions_list_view(request: AuthedRequest) -> Response:
    query_set = request.user.session_set

    if request.method == "DELETE":
        query_set.exclude(pk=request.session.session_key).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    qs = query_set.filter(expire_date__gt=timezone.now()).order_by("-last_activity")

    return Response(
        SessionSerializer(
            qs, many=True, context=dict(request=request), dangerously_allow_db=True
        ).data
    )
