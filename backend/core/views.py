import datetime
from typing import List

from rest_framework import viewsets, status, mixins, views
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth

from .models import Recipe, Step, Tag, Ingredient, CartItem
from .serializers import (
    RecipeSerializer,
    StepSerializer,
    TagSerializer,
    IngredientSerializer,
    CartItemSerializer)
from .utils import combine_ingredients


class RecipeViewSet(viewsets.ModelViewSet):

    serializer_class = RecipeSerializer

    def get_queryset(self):
        """
        enables us to return a 404 if the person doesn't have access to the
        item instead of throwing a 403 as default
        """
        rec = Recipe.objects.filter(user=self.request.user)
        # count recipe views
        r = rec.first()
        if r is not None:
            r.count_view()
            r.save()
        return rec

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class StepViewSet(viewsets.ModelViewSet):

    queryset = Step.objects.all()
    serializer_class = StepSerializer

    def create(self, request, recipe_pk=None):
        """
        create the step and attach it to the correct recipe
        """
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            recipe = Recipe.objects.get(pk=recipe_pk)
            serializer.save(recipe=recipe)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ShoppingListView(views.APIView):

    def get(self, request) -> Response:
        cart_items = CartItem.objects.filter(recipe__user=request.user).filter(count__gt=0)

        ingredients: List[CartItem] = []
        for cart_item in cart_items:
            for _ in range(0, cart_item.count):
                ingredients += cart_item.recipe.ingredients

        return Response(combine_ingredients(list(ingredients)), status=status.HTTP_200_OK)


class TagViewSet(viewsets.ModelViewSet):

    queryset = Tag.objects.all()
    serializer_class = TagSerializer

    def create(self, request, recipe_pk=None):
        """
        create the tag and attach it to the correct recipe
        """
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            recipe = Recipe.objects.get(pk=recipe_pk)
            serializer.save(recipe=recipe)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CartViewSet(mixins.RetrieveModelMixin,
                  mixins.UpdateModelMixin,
                  mixins.ListModelMixin,
                  viewsets.GenericViewSet):

    serializer_class = CartItemSerializer

    def get_queryset(self):
        return CartItem.objects.filter(recipe__user=self.request.user)


class IngredientViewSet(viewsets.ModelViewSet):

    queryset = Ingredient.objects.all()
    serializer_class = IngredientSerializer

    def create(self, request, recipe_pk=None):
        """
        create the ingredient and attach it to the correct recipe
        """
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            recipe = Recipe.objects.get(pk=recipe_pk)
            serializer.save(recipe=recipe)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserStats(APIView):

    def get(self, request, format=None):
        total_recipe_views = Recipe.objects.filter(user=self.request.user).aggregate(
            total=Sum('views')
            ).get('total')

        last_week = datetime.datetime.today() - datetime.timedelta(days=7)
        new_recipes_last_week = Recipe.objects.filter(user=self.request.user).filter(created__gt=last_week).count()

        most_viewed_recipe = Recipe.objects.filter(user=self.request.user).order_by('-views').values().first()

        recipes_added_by_month = Recipe.objects.annotate(month=TruncMonth('created')).values('month').annotate(c=Count('id')).order_by()

        recipes_pie_not_pie = Recipe.objects.filter(name__search='pie').count()
        total_recipes = Recipe.objects.count()

        date_joined = request.user.created.strftime('%b, %Y')

        return Response({
            'hello': 'world',
            'total_views': total_recipe_views,
            'new_recipes_last_week': new_recipes_last_week,
            'most_viewed_recipe': most_viewed_recipe,
            'date_joined': date_joined,
            'recipes_pie_not_pie': (recipes_pie_not_pie, total_recipes),
            'recipes_added_by_month': recipes_added_by_month,
        })
