from django.shortcuts import render

from rest_framework import viewsets, mixins, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Recipe, Step
from .serializers import RecipeSerializer, StepSerializer
from .permissions import IsOwnerOrAdmin


class RecipeViewSet(viewsets.ModelViewSet):

    serializer_class = RecipeSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]

    def get_queryset(self):
        """
        enables us to return a 404 if the person doesn't have access to the
        item instead of throwing a 403 as default
        """
        user = self.request.user
        if user.is_admin:
            return Recipe.objects.all()
        else:
            return Recipe.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class StepViewSet(mixins.CreateModelMixin,
                  viewsets.GenericViewSet):

    queryset = Step.objects.all()
    serializer_class = StepSerializer
    permission_classes = [IsOwnerOrAdmin]

    def create(self, request, recipe_pk=None):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            recipe = Recipe.objects.get(pk=recipe_pk)
            serializer.save(recipe=recipe)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
