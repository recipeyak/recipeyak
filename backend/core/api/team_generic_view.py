from typing import Any, Tuple, cast

from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.api.base.permissions import IsTeamAdmin
from core.api.base.request import AuthedRequest
from core.api.serializers.team import TeamSerializer
from core.models import Team


class TeamViewSet(viewsets.ModelViewSet):
    """
    Team viewset for /t/<team>

    Retrieve - Anyone if public, otherwise only members
    List - Anyone if public, otherwise only members
    Destroy - Only TeamAdmins can destroy
    Update - Only TeamAdmins can update
    """

    serializer_class = TeamSerializer

    def get_queryset(self):
        return Team.objects.filter(
            membership__user_id=cast(AuthedRequest, self.request).user.id
        ) | Team.objects.filter(is_public=True)

    def get_permissions(self):
        permission_classes: Tuple[Any, ...]
        if self.action in ("retrieve", "list", "create"):
            permission_classes = (IsAuthenticated,)
        else:
            permission_classes = (IsAuthenticated, IsTeamAdmin)
        return [permission() for permission in permission_classes]

    def create(self, request):
        serializer = self.serializer_class(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        team = serializer.save()
        team.force_join_admin(request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
