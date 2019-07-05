from django.conf import settings
from django.conf.urls import include, url
from django.urls import path
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import permissions
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers

from core.recipes.views import (
    IngredientViewSet,
    RecipeViewSet,
    StepViewSet,
    TeamRecipesViewSet,
)
from core.schedule.views import (
    CalendarViewSet,
    ReportBadMerge,
    ShoppingListView,
    TeamShoppingListViewSet,
)
from core.stats.views import UserStats
from core.teams.views import (
    MembershipViewSet,
    TeamInviteViewSet,
    TeamViewSet,
    UserInvitesViewSet,
)

router = DefaultRouter()
router.register(r"recipes", RecipeViewSet, basename="recipes")
router.register(r"t", TeamViewSet, basename="teams")
router.register(r"invites", UserInvitesViewSet, basename="user-invites")

recipes_router = routers.NestedSimpleRouter(router, r"recipes", lookup="recipe")
recipes_router.register(r"steps", StepViewSet, basename="recipe-step")
recipes_router.register(r"ingredients", IngredientViewSet, basename="recipe-ingredient")

teams_router = routers.NestedSimpleRouter(router, r"t", lookup="team")
teams_router.register(r"members", MembershipViewSet, basename="team-member")
teams_router.register(r"invites", TeamInviteViewSet, basename="team-invites")
teams_router.register(r"recipes", TeamRecipesViewSet, basename="team-recipes")
teams_router.register(
    r"shoppinglist", TeamShoppingListViewSet, basename="team-shoppinglist"
)
teams_router.register(r"calendar", CalendarViewSet, basename="calendar")

urlpatterns = [
    url(r"^api/v1/auth/", include("core.auth.urls")),
    url(r"^api/v1/", include("core.users.urls")),
    url(r"^api/v1/auth/registration/", include("core.auth.registration.urls")),
    url(r"", include("core.export.urls")),
    url(r"api/v1/", include(router.urls)),
    url(r"api/v1/", include(recipes_router.urls)),
    url(r"api/v1/", include(teams_router.urls)),
    url(r"^api/v1/shoppinglist", ShoppingListView.as_view(), name="shopping-list"),
    url(r"^api/v1/user_stats", UserStats.as_view(), name="user-stats"),
    url(r"^api/v1/report-bad-merge", ReportBadMerge.as_view(), name="report-bad-merge"),
]

if settings.DEBUG:
    schema_view = get_schema_view(
        openapi.Info(title="Recipe Yak API", default_version="v1"),
        public=True,
        permission_classes=(permissions.AllowAny,),
    )
    urlpatterns.append(
        path(
            "swagger/",
            schema_view.with_ui("swagger", cache_timeout=0),
            name="schema-swagger-ui",
        )
    )
