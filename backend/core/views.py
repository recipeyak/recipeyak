from django.shortcuts import render

from rest_framework import viewsets, mixins, status
from rest_framework.response import Response

from .models import Recipe
from .serializers import RecipeSerializer
from .permissions import IsOwnerOrAdmin


class RecipeViewSet(mixins.CreateModelMixin,
                    mixins.RetrieveModelMixin,
                    mixins.UpdateModelMixin,
                    mixins.DestroyModelMixin,
                    mixins.ListModelMixin,
                    viewsets.GenericViewSet):

    queryset = Recipe.objects.all()
    serializer_class = RecipeSerializer
    permission_classes = [IsOwnerOrAdmin]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
