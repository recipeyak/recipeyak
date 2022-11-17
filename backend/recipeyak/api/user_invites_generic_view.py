from django.db.models import QuerySet
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from recipeyak.api.serializers.team import InviteSerializer
from recipeyak.models import Invite


class UserInvitesViewSet(
    viewsets.GenericViewSet, mixins.RetrieveModelMixin, mixins.ListModelMixin
):
    """
    Personal route that lists all of a users invites via `/invites`

    Retrieve - return specific invite for user
    List - return all invites user

    Detail routes
    `invites/<id>/accept` - post to accept invite
    `invites/<id>/decline` - post to decline invite
    """

    serializer_class = InviteSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self) -> QuerySet[Invite]:
        return (
            Invite.objects.filter(membership__user=self.request.user)
            .select_related("membership", "creator")
            .prefetch_related("membership__user", "membership__team")
        )

    @action(detail=True, methods=["post"], url_name="accept")
    def accept(self, request: Request, pk: str) -> Response:
        invite = self.get_object()
        invite.accept()
        return Response({"detail": "accepted invite"}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"])
    def decline(self, request: Request, pk: str) -> Response:
        invite = self.get_object()
        invite.decline()
        return Response({"detail": "declined invite"}, status=status.HTTP_200_OK)
