from django.shortcuts import render

from rest_framework import viewsets, mixins, status
from rest_framework.response import Response

from .models import Recipe, Step
from .serializers import RecipeSerializer, StepSerializer
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


class StepViewSet(mixins.CreateModelMixin,
                  viewsets.GenericViewSet):

    queryset = Step.objects.all()
    serializer_class = StepSerializer
    permission_classes = [IsOwnerOrAdmin]

    def create(self, request, recipe_pk=None):
        serializer = StepSerializer(data=request.data)
        if serializer.is_valid():
            recipe = Recipe.objects.get(pk=recipe_pk)
            serializer.save(recipe=recipe)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
