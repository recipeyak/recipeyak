from django.shortcuts import render

from rest_framework import viewsets, mixins

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
