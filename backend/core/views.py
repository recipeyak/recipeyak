from datetime import datetime, timedelta
import logging
from typing import List
import pytz

from rest_framework import viewsets, status, views
from django.core.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth

from .models import (
    Recipe,
    Ingredient,
    ScheduledRecipe,
)

from .serializers import (
    ScheduledRecipeSerializer,
    ScheduledRecipeSerializerCreate,
)

from .utils import combine_ingredients

logger = logging.getLogger(__name__)


class ShoppingListView(views.APIView):

    permission_classes = (IsAuthenticated,)

    def get(self, request) -> Response:
        start = request.query_params.get('start')
        end = request.query_params.get('end')

        try:
            scheduled_recipes = (request.user.scheduled_recipes
                                 .filter(on__gte=start)
                                 .filter(on__lte=end))
        except (ValueError, ValidationError):
            return Response(status=status.HTTP_400_BAD_REQUEST)

        ingredients: List[Ingredient] = []
        for scheduled_recipe in scheduled_recipes:
            for _ in range(scheduled_recipe.count):
                ingredients += scheduled_recipe.recipe.ingredients

        return Response(combine_ingredients(ingredients), status=status.HTTP_200_OK)


class UserStats(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, format=None) -> Response:
        user_recipes = Recipe.objects.filter(owner_user=request.user)

        total_recipe_edits = user_recipes \
            .aggregate(total=Sum('edits')) \
            .get('total')

        last_week = datetime.now(tz=pytz.UTC) - timedelta(days=7)

        new_recipes_last_week = user_recipes \
            .filter(created__gt=last_week).count()

        last_month = datetime.now(tz=pytz.UTC) - timedelta(days=30)

        total_recipes_added_last_month_by_all_users = Recipe.objects \
            .filter(created__gte=last_month) \
            .count()

        recipes_added_by_month = user_recipes \
            .annotate(month=TruncMonth('created')) \
            .values('month') \
            .annotate(c=Count('id')) \
            .order_by()

        recipes_pie_not_pie = Recipe.objects \
            .filter(name__search='pie') \
            .count()

        total_recipes = Recipe.objects.count()

        date_joined = request.user.created.strftime('%b, %Y')

        logger.info(f'UserStats fetched by {request.user}')

        return Response({
            'total_user_recipes': user_recipes.count(),
            'total_recipe_edits': total_recipe_edits,
            'new_recipes_last_week': new_recipes_last_week,
            'date_joined': date_joined,
            'recipes_pie_not_pie': (recipes_pie_not_pie, total_recipes),
            'recipes_added_by_month': recipes_added_by_month,
            'total_recipes_added_last_month_by_all_users': total_recipes_added_last_month_by_all_users,
        })


class ReportBadMerge(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, format=None):
        user = request.user
        logger.warn(f'bad combine for user: {user} with recipes: {user.scheduled_recipes}')
        return Response(status=status.HTTP_201_CREATED)


class CalendarViewSet(viewsets.ModelViewSet):
    serializer_class = ScheduledRecipeSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return (ScheduledRecipe.objects
                .filter(user=self.request.user))

    def create(self, request):
        # use different create serializer since we create via primary key, and
        # return an objects
        serializer = ScheduledRecipeSerializerCreate(data=request.data)
        serializer.is_valid(raise_exception=True)

        n = serializer.save(user=request.user)
        return Response(self.get_serializer(n).data, status=status.HTTP_201_CREATED)

    def list(self, request):
        start = request.query_params.get('start')
        end = request.query_params.get('end')
        try:
            queryset = (self.get_queryset()
                            .filter(on__gte=start)
                            .filter(on__lte=end))
        except (ValueError, ValidationError):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        serializer = self.get_serializer(queryset,
                                         many=True,)
        return Response(serializer.data, status=status.HTTP_200_OK)
