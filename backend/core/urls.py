from django.conf.urls import include, url
from django.urls import path
from django.views.generic import TemplateView
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers

from core.ical.views import get_ical_view
from core.recipes.views import RecipeViewSet, TeamRecipesViewSet
from core.recipes.views.ingredients_list_view import ingredients_list_view
from core.recipes.views.reactions_view import (
    note_reaction_create_view,
    note_reaction_delete_view,
)
from core.recipes.views.recently_view_recipes_view import get_recently_viewed_recipes
from core.recipes.views.sections_view import (
    create_section_view,
    delete_or_update_section_view,
)
from core.recipes.views.timeline_view import get_recipe_timeline
from core.schedule.views import CalendarViewSet, ReportBadMerge, get_shopping_list_view
from core.teams.views import (
    MembershipViewSet,
    TeamInviteViewSet,
    TeamViewSet,
    UserInvitesViewSet,
)
from core.uploads import views as upload

from .recipes.views.ingredients_detail_view import ingredients_detail_view
from .recipes.views.notes_view import note_create_view, note_detail_view
from .recipes.views.steps_detail_view import steps_detail_view
from .recipes.views.steps_list_view import steps_list_view

router = DefaultRouter()
router.register(r"recipes", RecipeViewSet, basename="recipes")
router.register(r"t", TeamViewSet, basename="teams")
router.register(r"invites", UserInvitesViewSet, basename="user-invites")

recipes_router = routers.NestedSimpleRouter(router, r"recipes", lookup="recipe")

teams_router = routers.NestedSimpleRouter(router, r"t", lookup="team")
teams_router.register(r"members", MembershipViewSet, basename="team-member")
teams_router.register(r"invites", TeamInviteViewSet, basename="team-invites")
teams_router.register(r"calendar", CalendarViewSet, basename="calendar")

urlpatterns = [
    path("api/v1/auth/", include("core.auth.urls")),
    path("api/v1/", include("core.users.urls")),
    path("api/v1/auth/registration/", include("core.auth.registration.urls")),
    path("", include("core.export.urls")),
    path("t/<int:team_id>/ical/<str:ical_id>/schedule.ics", get_ical_view),
    path("api/v1/", include(router.urls)),
    path("api/v1/", include(recipes_router.urls)),
    path("api/v1/recipes/recently_viewed", get_recently_viewed_recipes),
    path("api/v1/recipes/<int:recipe_pk>/timeline", get_recipe_timeline),
    path("api/v1/recipes/<int:recipe_pk>/sections", create_section_view),
    path(
        "api/v1/recipes/<int:recipe_pk>/ingredients/<int:ingredient_pk>/",
        ingredients_detail_view,
    ),
    path("api/v1/recipes/<int:recipe_pk>/ingredients/", ingredients_list_view),
    path("api/v1/recipes/<int:recipe_pk>/steps/", steps_list_view),
    path("api/v1/recipes/<int:recipe_pk>/steps/<int:step_pk>/", steps_detail_view),
    path("api/v1/sections/<int:section_pk>/", delete_or_update_section_view),
    path("api/v1/recipes/<int:recipe_pk>/notes/", note_create_view),
    path("api/v1/notes/<int:note_pk>/reactions/", note_reaction_create_view),
    path("api/v1/notes/<int:note_pk>/", note_detail_view),
    path("api/v1/reactions/<str:reaction_pk>/", note_reaction_delete_view),
    path("api/v1/", include(teams_router.urls)),
    path("api/v1/t/<team_pk>/shoppinglist/", get_shopping_list_view),
    path("api/v1/report-bad-merge", ReportBadMerge.as_view(), name="report-bad-merge"),
    path("api/v1/upload/", upload.start_upload),
    path("api/v1/upload/<int:upload_pk>/complete", upload.complete_upload),
    path(
        "api/v1/t/<int:team_pk>/recipes/",
        TeamRecipesViewSet.as_view(),
        name="team-recipes",
    ),
    url(r"^api-auth/", include("rest_framework.urls", namespace="rest_framework")),
    # we don't actually use this view. This serves as the url for the reset email
    url(
        r"^password-reset/confirm/(?P<uidb64>[0-9A-Za-z_\-]+)\.(?P<token>[0-9A-Za-z]{1,13}-[0-9A-Za-z]{1,20})/$",
        TemplateView.as_view(template_name="password_reset_confirm.html"),
        name="password_reset_confirm",
    ),
    url(
        r"^signup/$",
        TemplateView.as_view(template_name="socialccount_signup.html"),
        name="socialaccount_signup",
    ),
    url(
        r"^settings/$",
        TemplateView.as_view(template_name="socialaccount_connections.html"),
        name="socialaccount_connections",
    ),
]
