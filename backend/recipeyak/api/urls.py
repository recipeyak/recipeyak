from django.conf.urls import url
from django.urls import path

from recipeyak.api.calendar_detail_view import calendar_detail_view
from recipeyak.api.calendar_generate_link_view import generate_link
from recipeyak.api.calendar_list_view import calendar_list_view
from recipeyak.api.calendar_next_open_view import next_open
from recipeyak.api.calendar_update_settings_view import update_settings
from recipeyak.api.export_recipes_list_view import export_recipes_list_view
from recipeyak.api.ical_detail_view import get_ical_view
from recipeyak.api.ingredients_detail_view import ingredients_detail_view
from recipeyak.api.ingredients_list_view import ingredients_list_view
from recipeyak.api.login_user_detail_view import login_user_detail_view
from recipeyak.api.logout_user_detail_view import logout_user_detail_view
from recipeyak.api.notes_view import note_create_view, note_detail_view
from recipeyak.api.password_change_detail_view import password_change_detail_view
from recipeyak.api.password_reset_confirm_view import password_reset_confirm_view
from recipeyak.api.password_reset_view import password_reset_view
from recipeyak.api.reactions_view import (
    note_reaction_create_view,
    note_reaction_delete_view,
)
from recipeyak.api.recently_created_recipes_view import get_recently_created_recipes
from recipeyak.api.recently_view_recipes_view import get_recently_viewed_recipes
from recipeyak.api.recipe_bot_detail_view import (
    receipe_detail_view as recipe_bot_detail_view,
)
from recipeyak.api.recipe_detail_view import receipe_detail_view
from recipeyak.api.recipe_list_view import recipe_list_view
from recipeyak.api.register_user_detail_view import register_user_detail_view
from recipeyak.api.sections_view import (
    create_section_view,
    delete_or_update_section_view,
)
from recipeyak.api.sessions_detail_view import sessions_detail_view
from recipeyak.api.sessions_list_view import sessions_list_view
from recipeyak.api.steps_detail_view import steps_detail_view
from recipeyak.api.steps_list_view import steps_list_view
from recipeyak.api.team_detail_view import team_detail_view
from recipeyak.api.team_invite_list_view import team_invite_list_view
from recipeyak.api.team_list_view import team_list_view
from recipeyak.api.team_members_detail_view import team_members_detail_view
from recipeyak.api.team_members_list_view import team_members_list_view
from recipeyak.api.team_shopping_list_detail_view import get_shopping_list_view
from recipeyak.api.timeline_view import get_recipe_timeline
from recipeyak.api.uploads_detail_view import complete_upload_view
from recipeyak.api.uploads_list_view import start_upload_view
from recipeyak.api.user_detail_view import user_detail_view
from recipeyak.api.user_invites_accept_view import user_invites_accept_view
from recipeyak.api.user_invites_decline_view import user_invites_decline_view
from recipeyak.api.user_invites_list_view import user_invites_list_view

urlpatterns = [
    path("api/v1/t/<int:team_pk>/members/", team_members_list_view),
    path("api/v1/t/<int:team_pk>/members/<int:pk>/", team_members_detail_view),
    path("api/v1/auth/login/", login_user_detail_view),
    path("api/v1/auth/logout/", logout_user_detail_view),
    path("api/v1/auth/password/change/", password_change_detail_view),
    path("api/v1/auth/password/reset/", password_reset_view),
    path("api/v1/auth/password/reset/confirm/", password_reset_confirm_view),
    path("api/v1/auth/registration/", register_user_detail_view),
    path("api/v1/invites/", user_invites_list_view),
    path("api/v1/invites/<int:pk>/accept/", user_invites_accept_view),
    path("api/v1/invites/<int:pk>/decline/", user_invites_decline_view),
    path("api/v1/t/<int:team_pk>/invites/", team_invite_list_view),
    path("api/v1/t/<int:team_pk>/", team_detail_view),
    path("api/v1/t/", team_list_view),
    path("api/v1/notes/<int:note_pk>/", note_detail_view),
    path("api/v1/notes/<int:note_pk>/reactions/", note_reaction_create_view),
    path("api/v1/reactions/<str:reaction_pk>/", note_reaction_delete_view),
    path("api/v1/recipes/", recipe_list_view),
    path("api/v1/recipes/<int:recipe_pk>/", receipe_detail_view),
    path("api/v1/recipes/<int:recipe_pk>/ingredients/", ingredients_list_view),
    path(
        "api/v1/recipes/<int:recipe_pk>/ingredients/<int:ingredient_pk>/",
        ingredients_detail_view,
    ),
    path("api/v1/recipes/<int:recipe_pk>/notes/", note_create_view),
    path("api/v1/recipes/<int:recipe_pk>/sections", create_section_view),
    path("api/v1/recipes/<int:recipe_pk>/steps/", steps_list_view),
    path("api/v1/recipes/<int:recipe_pk>/steps/<int:step_pk>/", steps_detail_view),
    path("api/v1/recipes/<int:recipe_pk>/timeline", get_recipe_timeline),
    path("api/v1/recipes/recently_viewed", get_recently_viewed_recipes),
    path("api/v1/recipes/recently_created", get_recently_created_recipes),
    path("api/v1/sections/<int:section_pk>/", delete_or_update_section_view),
    path("api/v1/sessions/", sessions_list_view),
    path("api/v1/sessions/<str:pk>/", sessions_detail_view),
    # TODO: remove team param from these
    path("api/v1/t/<int:team_pk>/calendar/", calendar_list_view),
    path("api/v1/t/<int:team_pk>/calendar/settings/", update_settings),
    path("api/v1/t/<int:team_pk>/calendar/next_open/", next_open),
    path("api/v1/t/<int:team_pk>/calendar/generate_link/", generate_link),
    path("api/v1/t/<int:team_pk>/calendar/<int:pk>/", calendar_detail_view),
    path("api/v1/t/<int:team_pk>/shoppinglist/", get_shopping_list_view),
    path("api/v1/upload/", start_upload_view),
    path("api/v1/upload/<int:upload_pk>/complete", complete_upload_view),
    path("api/v1/user/", user_detail_view),
    path("t/<int:team_id>/ical/<str:ical_id>/schedule.ics", get_ical_view),
    url(r"^recipes/(?P<recipe_pk>[0-9]+)(-.*)?$", recipe_bot_detail_view),
    url(r"^recipes.(?P<filetype>json|yaml|yml)$", export_recipes_list_view),
    url(
        r"^recipes/(?P<pk>[0-9]+)\.(?P<filetype>json|yaml|yml)$",
        export_recipes_list_view,
    ),
]
