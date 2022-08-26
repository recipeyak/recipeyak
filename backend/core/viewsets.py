from typing import TYPE_CHECKING

from rest_framework import mixins, viewsets

from core.request import AuthedRequest


class ModelViewSet(viewsets.ModelViewSet):
    if TYPE_CHECKING:
        request: AuthedRequest


class ListModelViewSet(
    mixins.CreateModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet
):
    if TYPE_CHECKING:
        request: AuthedRequest
