from typing import TYPE_CHECKING

from rest_framework import viewsets

from core.request import AuthedRequest


class ModelViewSet(viewsets.ModelViewSet):
    if TYPE_CHECKING:
        request: AuthedRequest
