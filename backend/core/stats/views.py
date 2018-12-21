from datetime import datetime, timedelta
import pytz
import logging

from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth

from core.models import Recipe

logger = logging.getLogger(__name__)


class UserStats(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, format=None) -> Response:
        user_recipes = Recipe.objects.filter(owner_user=request.user)

        total_recipe_edits = user_recipes.aggregate(total=Sum("edits")).get("total")

        last_week = datetime.now(tz=pytz.UTC) - timedelta(days=7)

        new_recipes_last_week = user_recipes.filter(created__gt=last_week).count()

        last_month = datetime.now(tz=pytz.UTC) - timedelta(days=30)

        total_recipes_added_last_month_by_all_users = Recipe.objects.filter(
            created__gte=last_month
        ).count()

        recipes_added_by_month = (
            user_recipes.annotate(month=TruncMonth("created"))
            .values("month")
            .annotate(c=Count("id"))
            .order_by()
        )

        recipes_pie_not_pie = Recipe.objects.filter(name__search="pie").count()

        total_recipes = Recipe.objects.count()

        date_joined = request.user.created.strftime("%b, %Y")

        logger.info(f"UserStats fetched by {request.user}")

        return Response(
            {
                "total_user_recipes": user_recipes.count(),
                "total_recipe_edits": total_recipe_edits,
                "new_recipes_last_week": new_recipes_last_week,
                "date_joined": date_joined,
                "recipes_pie_not_pie": (recipes_pie_not_pie, total_recipes),
                "recipes_added_by_month": recipes_added_by_month,
                "total_recipes_added_last_month_by_all_users": total_recipes_added_last_month_by_all_users,
            }
        )
