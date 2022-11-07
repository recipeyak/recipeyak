from rest_framework import mixins, viewsets

from recipeyak.api.base.request import AuthedRequest


class ModelViewSet(viewsets.ModelViewSet):
    request: AuthedRequest


class ListModelViewSet(
    mixins.CreateModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet
):
    request: AuthedRequest
