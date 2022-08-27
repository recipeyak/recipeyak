from django.conf.urls import include, url
from django.urls import path
from rest_framework.routers import DefaultRouter

from core.auth.registration.views import RegisterView
from core.auth.views import LoginView, LogoutView, PasswordChangeView
from core.export.views import export_recipes
from core.ical.views import get_ical_view
from core.recipes.views.ingredients_list_view import ingredients_list_view
from core.recipes.views.reactions_view import (
    note_reaction_create_view,
    note_reaction_delete_view,
)
from core.recipes.views.recently_view_recipes_view import get_recently_viewed_recipes
from core.recipes.views.recipe_copy_view import recipe_copy_view
from core.recipes.views.recipe_duplicate_view import recipe_duplicate_view
from core.recipes.views.recipe_move_view import recipe_move_view
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
from core.users.views import UserDetailsView, sessions, sessions_detail
from core.views.password_reset_confirm_view import password_reset_confirm_view
from core.views.password_reset_view import password_reset_view
from core.views.recipe_detail_view import receipe_detail_view
from core.views.recipe_list_view import recipe_list_view

from .recipes.views.ingredients_detail_view import ingredients_detail_view
from .recipes.views.notes_view import note_create_view, note_detail_view
from .recipes.views.steps_detail_view import steps_detail_view
from .recipes.views.steps_list_view import steps_list_view

router = DefaultRouter()
router.register(r"t", TeamViewSet, basename="teams")
router.register(r"invites", UserInvitesViewSet, basename="user-invites")


teams_router = DefaultRouter()
teams_router.register(r"members", MembershipViewSet, basename="team-member")
teams_router.register(r"invites", TeamInviteViewSet, basename="team-invites")
teams_router.register(r"calendar", CalendarViewSet, basename="calendar")

urlpatterns = [
    path("api/v1/auth/password/reset/", password_reset_view),
    path("api/v1/auth/password/reset/confirm/", password_reset_confirm_view),
    path("api/v1/auth/login/", LoginView.as_view()),
    path("api/v1/auth/logout/", LogoutView.as_view()),
    path("api/v1/auth/password/change/", PasswordChangeView.as_view()),
    path("api/v1/user/", UserDetailsView.as_view()),
    path("api/v1/sessions/", sessions),
    path("api/v1/sessions/<str:pk>/", sessions_detail),
    path("api/v1/auth/registration/", RegisterView.as_view(), name="rest_register"),
    url(r"^recipes.(?P<filetype>json|yaml|yml)$", export_recipes),
    url(
        r"^recipes/(?P<pk>[0-9]+).*\.(?P<filetype>json|yaml|yml)$",
        export_recipes,
    ),
    path("t/<int:team_id>/ical/<str:ical_id>/schedule.ics", get_ical_view),
    path("api/v1/", include(router.urls)),
    path("api/v1/recipes/", recipe_list_view),
    path("api/v1/recipes/recently_viewed", get_recently_viewed_recipes),
    path("api/v1/recipes/<int:recipe_pk>/", receipe_detail_view),
    path("api/v1/recipes/<int:recipe_pk>/timeline", get_recipe_timeline),
    path("api/v1/recipes/<int:recipe_pk>/sections", create_section_view),
    path("api/v1/recipes/<int:recipe_pk>/duplicate/", recipe_duplicate_view),
    path("api/v1/recipes/<int:recipe_pk>/move/", recipe_move_view),
    path("api/v1/recipes/<int:recipe_pk>/copy/", recipe_copy_view),
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
    path("api/v1/t/<team_pk>/", include(teams_router.urls)),
    path("api/v1/t/<team_pk>/shoppinglist/", get_shopping_list_view),
    path("api/v1/report-bad-merge", ReportBadMerge.as_view(), name="report-bad-merge"),
    path("api/v1/upload/", upload.start_upload),
    path("api/v1/upload/<int:upload_pk>/complete", upload.complete_upload),
]
