from django.conf.urls import include
from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers

from core.recipes.views import (
    IngredientViewSet,
    NoteViewSet,
    RecipeViewSet,
    StepViewSet,
    TeamRecipesViewSet,
    get_recipe_timeline,
)
from core.schedule.views import CalendarViewSet, ReportBadMerge, get_shopping_list_view
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
router.register(r"notes", NoteViewSet)

recipes_router = routers.NestedSimpleRouter(router, r"recipes", lookup="recipe")
recipes_router.register(r"steps", StepViewSet, basename="recipe-step")
recipes_router.register(r"ingredients", IngredientViewSet, basename="recipe-ingredient")
recipes_router.register(r"notes", NoteViewSet, basename="recipe-note")

teams_router = routers.NestedSimpleRouter(router, r"t", lookup="team")
teams_router.register(r"members", MembershipViewSet, basename="team-member")
teams_router.register(r"invites", TeamInviteViewSet, basename="team-invites")
teams_router.register(r"calendar", CalendarViewSet, basename="calendar")

urlpatterns = [
    path("api/v1/auth/", include("core.auth.urls")),
    path("api/v1/", include("core.users.urls")),
    path("api/v1/auth/registration/", include("core.auth.registration.urls")),
    path("", include("core.export.urls")),
    path("api/v1/", include(router.urls)),
    path("api/v1/", include(recipes_router.urls)),
    path("api/v1/recipes/<int:recipe_pk>/timeline", get_recipe_timeline),
    path("api/v1/", include(teams_router.urls)),
    path("api/v1/t/<team_pk>/shoppinglist/", get_shopping_list_view),
    path("api/v1/user_stats", UserStats.as_view(), name="user-stats"),
    path("api/v1/report-bad-merge", ReportBadMerge.as_view(), name="report-bad-merge"),
    path(
        "api/v1/t/<int:team_pk>/recipes/",
        TeamRecipesViewSet.as_view(),
        name="team-recipes",
    ),
]
