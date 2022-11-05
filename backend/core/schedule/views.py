import logging
from typing import List, Optional, TypeVar, cast

from django.core.exceptions import ValidationError
from django.db import connection
from django.db.models import QuerySet
from django.shortcuts import get_object_or_404
from rest_framework import serializers, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from typing_extensions import TypedDict

from core import viewsets
from core.api.permissions import IsTeamMember
from core.cumin.cat import category
from core.cumin.combine import Ingredient, combine_ingredients
from core.json import JSONRenderer
from core.models import (
    Membership,
    ScheduledRecipe,
    ShoppingList,
    Team,
    get_random_ical_id,
)
from core.request import AuthedRequest
from core.schedule.serializers import (
    ScheduledRecipeSerializer,
    ScheduledRecipeSerializerCreate,
)

logger = logging.getLogger(__name__)

T = TypeVar("T")


def unwrap(arg: Optional[T]) -> T:
    assert arg is not None
    return arg


def get_scheduled_recipes(
    *, request: AuthedRequest, team_pk: str
) -> Optional[QuerySet[ScheduledRecipe]]:
    start = request.query_params.get("start")
    end = request.query_params.get("end")

    if team_pk in {"personal", "me"}:
        scheduled_recipes = cast(
            QuerySet[ScheduledRecipe], request.user.scheduled_recipes
        )
    else:
        team = Team.objects.filter(pk=team_pk).first()
        if team is None:
            return None
        scheduled_recipes = team.scheduled_recipes

    try:
        return scheduled_recipes.filter(on__gte=start).filter(on__lte=end)
    except (ValueError, ValidationError):
        return None


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsTeamMember])
def get_shopping_list_view(request: AuthedRequest, team_pk: str) -> Response:
    scheduled_recipes = get_scheduled_recipes(request=request, team_pk=team_pk)
    if scheduled_recipes is None:
        return Response(status=status.HTTP_400_BAD_REQUEST)

    ingredients: List[Ingredient] = []
    for scheduled_recipe in scheduled_recipes:
        for _ in range(scheduled_recipe.count):
            ingredients += (
                scheduled_recipe.recipe.ingredients  # type: ignore [arg-type]
            )

    ingredients = [
        Ingredient(quantity=i.quantity, name=i.name, description=i.description)
        for i in ingredients
    ]

    ingredient_mapping = combine_ingredients(ingredients)

    for ingredient in ingredient_mapping:
        ingredient_mapping[ingredient].category = category(ingredient)

    ShoppingList.objects.create(
        ingredients=JSONRenderer().render(ingredient_mapping).decode()
    )

    return Response(ingredient_mapping, status=status.HTTP_200_OK)


class ReportBadMerge(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request: AuthedRequest) -> Response:
        user = request.user
        logger.warning(
            "bad combine for user: %s with recipes: %s", user, user.scheduled_recipes
        )
        return Response(status=status.HTTP_201_CREATED)


class CalSettings(TypedDict):
    syncEnabled: bool
    calendarLink: str


def get_cal_settings(*, team_pk: str, request: AuthedRequest) -> CalSettings:
    membership = Membership.objects.get(team=team_pk, user=request.user)

    method = "https" if request.is_secure() else "http"
    calendar_link = (
        method
        + "://"
        + request.get_host()
        + f"/t/{team_pk}/ical/{membership.calendar_secret_key}/schedule.ics"
    )
    return {
        "syncEnabled": membership.calendar_sync_enabled,
        "calendarLink": calendar_link,
    }


class CalSettingsSerializer(serializers.Serializer):
    syncEnabled = serializers.BooleanField()


class StartEndDateSerializer(serializers.Serializer):
    start = serializers.DateField()
    end = serializers.DateField()


class CalendarViewSet(viewsets.ModelViewSet):
    serializer_class = ScheduledRecipeSerializer
    permission_classes = (IsAuthenticated, IsTeamMember)

    def get_queryset(self):
        pk = self.kwargs["team_pk"]
        if pk == "me":
            return ScheduledRecipe.objects.filter(
                user=self.request.user
            ).select_related("recipe")
        team = get_object_or_404(Team, pk=pk)
        return ScheduledRecipe.objects.filter(team=team).select_related("recipe")

    def create(  # type: ignore [override]
        self, request: AuthedRequest, team_pk: str
    ) -> Response:
        # use different create serializer since we create via primary key, and
        # return an objects
        serializer = ScheduledRecipeSerializerCreate(data=request.data)
        serializer.is_valid(raise_exception=True)

        if team_pk == "me":
            data = serializer.save(user=request.user)
        else:
            team = get_object_or_404(Team, pk=team_pk)
            data = serializer.save(team=team)
        return Response(
            self.get_serializer(data, dangerously_allow_db=True).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=["PATCH"], url_path="settings")
    def update_settings(self, request: AuthedRequest, team_pk: str) -> Response:
        serializer = CalSettingsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        sync_enabled = serializer.validated_data["syncEnabled"]

        membership = get_object_or_404(Membership, team=team_pk, user=request.user)
        membership.calendar_sync_enabled = sync_enabled
        membership.save()

        return Response(get_cal_settings(request=request, team_pk=team_pk))

    @action(detail=False, methods=["POST"])
    def generate_link(self, request: AuthedRequest, team_pk: str) -> Response:
        membership = get_object_or_404(Membership, team=team_pk, user=request.user)
        membership.calendar_secret_key = get_random_ical_id()
        membership.save()

        return Response(get_cal_settings(request=request, team_pk=team_pk))

    @action(detail=False, methods=["GET"])
    def next_open(self, request: AuthedRequest, team_pk: str) -> Response:
        with connection.cursor() as cursor:
            weekday = request.query_params["day"]
            now = request.query_params["now"]
            day_number = {
                "Sunday": (0,),
                "Monday": (1,),
                "Tuesday": (2,),
                "Wednesday": (3,),
                "Thursday": (4,),
                "Friday": (5,),
                "Saturday": (6,),
                "Weekday": (1, 2, 3, 4, 5),
                "Weekend": (0, 6),
            }[weekday]

            cursor.execute(
                """
SELECT
  gen_date::date "date"
FROM
  generate_series(%(now)s::date + '1 day'::interval, (%(now)s::date + '3 years'::interval), '1 day') "gen_date"
  LEFT JOIN core_scheduledrecipe ON core_scheduledrecipe."on" = gen_date
    AND team_id = %(team_id)s
WHERE
  date_part('dow', gen_date) in %(day_number)s
  AND id IS NULL
ORDER BY
  gen_date ASC
LIMIT 1;
""",
                {"day_number": day_number, "team_id": team_pk, "now": now},
            )
            (date,) = unwrap(cursor.fetchone())
            return Response({"date": date})

    def list(  # type: ignore [override]
        self, request: AuthedRequest, team_pk: str
    ) -> Response:
        serializer = StartEndDateSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        start = serializer.validated_data["start"]
        end = serializer.validated_data["end"]

        queryset = self.get_queryset().filter(on__gte=start).filter(on__lte=end)
        scheduled_recipes = self.get_serializer(queryset, many=True).data

        if "v2" in request.query_params:
            # HACK(sbdchd): we don't support the calendar stuff for personal
            # schedules due to us storing info on the team membership.
            if team_pk == "me":
                return Response(
                    {
                        "scheduledRecipes": scheduled_recipes,
                        "settings": {"syncEnabled": False, "calendarLink": ""},
                    }
                )

            settings = get_cal_settings(request=request, team_pk=team_pk)

            return Response(
                {"scheduledRecipes": scheduled_recipes, "settings": settings}
            )

        return Response(scheduled_recipes, status=status.HTTP_200_OK)
