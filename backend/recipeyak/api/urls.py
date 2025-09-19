from recipeyak.api.ably_retrieve_view import ably_retrieve_view
from recipeyak.api.algolia_retrieve_view import algolia_retrieve_view
from recipeyak.api.base.router import create_urlpatterns, route
from recipeyak.api.calendar_create_view import calendar_create_view
from recipeyak.api.calendar_delete_view import calendar_delete_view
from recipeyak.api.calendar_event_delete_view import calendar_event_delete_view
from recipeyak.api.calendar_generate_link_view import calendar_generate_link_view
from recipeyak.api.calendar_list_view import calendar_list_view
from recipeyak.api.calendar_pin_create_view import calendar_pin_create_view
from recipeyak.api.calendar_settings_retrieve_view import (
    calendar_settings_retrieve_view,
)
from recipeyak.api.calendar_update_settings_view import calendar_update_settings_view
from recipeyak.api.calendar_update_view import calendar_update_view
from recipeyak.api.calendars_list_view import calendars_list_view
from recipeyak.api.cook_checklist_create_view import cook_checklist_create_view
from recipeyak.api.cook_checklist_retrieve_view import cook_checklist_retrieve_view
from recipeyak.api.export_recipes_list_view import export_recipes_list_view
from recipeyak.api.ical_retrieve_view import ical_retrieve_view
from recipeyak.api.ingredient_create_view import ingredient_create_view
from recipeyak.api.ingredient_delete_view import ingredient_delete_view
from recipeyak.api.ingredient_update_view import ingredient_update_view
from recipeyak.api.invite_accept_view import invite_accept_view
from recipeyak.api.invite_create_view import invite_create_view
from recipeyak.api.invite_decline_view import invite_decline_view
from recipeyak.api.invite_list_view import invite_list_view
from recipeyak.api.member_delete_view import member_delete_view
from recipeyak.api.member_list_view import member_list_view
from recipeyak.api.member_update_view import member_update_view
from recipeyak.api.note_create_view import note_create_view
from recipeyak.api.note_delete_view import note_delete_view
from recipeyak.api.note_update_view import note_update_view
from recipeyak.api.reaction_create_view import reaction_create_view
from recipeyak.api.reaction_delete_view import reaction_delete_view
from recipeyak.api.recipe_bot_detail_view import recipe_bot_detail_view
from recipeyak.api.recipe_create_view import recipe_create_view
from recipeyak.api.recipe_delete_view import recipe_delete_view
from recipeyak.api.recipe_recently_created_view import (
    recipe_recently_created_view,
)
from recipeyak.api.recipe_recently_viewed_view import recipe_recently_viewed_view
from recipeyak.api.recipe_retrieve_view import recipe_retrieve_view
from recipeyak.api.recipe_timeline_view import recipe_timeline_view
from recipeyak.api.recipe_update_view import recipe_update_view
from recipeyak.api.scheduled_recipe_create_view import scheduled_recipe_create_view
from recipeyak.api.section_create_view import section_create_view
from recipeyak.api.section_delete_view import section_delete_view
from recipeyak.api.section_update_view import section_update_view
from recipeyak.api.session_delete_all_view import session_delete_all_view
from recipeyak.api.session_delete_view import session_delete_view
from recipeyak.api.session_list_view import session_list_view
from recipeyak.api.shoppinglist_retrieve_view import shoppinglist_retrieve_view
from recipeyak.api.step_create_view import step_create_view
from recipeyak.api.step_delete_view import step_delete_view
from recipeyak.api.step_update_view import step_update_view
from recipeyak.api.team_create_view import team_create_view
from recipeyak.api.team_delete_view import team_delete_view
from recipeyak.api.team_list_view import team_list_view
from recipeyak.api.team_retrieve_view import team_retrieve_view
from recipeyak.api.team_update_view import team_update_view
from recipeyak.api.upload_complete_view import upload_complete_view
from recipeyak.api.upload_start_view import upload_start_view
from recipeyak.api.user_comments_list_view import user_comments_list_view
from recipeyak.api.user_create_view import user_create_view
from recipeyak.api.user_delete_view import user_delete_view
from recipeyak.api.user_login_view import user_login_view
from recipeyak.api.user_logout_view import user_logout_view
from recipeyak.api.user_password_reset_confirm_view import (
    user_password_reset_confirm_view,
)
from recipeyak.api.user_password_reset_view import user_password_reset_view
from recipeyak.api.user_password_update_view import user_password_update_view
from recipeyak.api.user_retrieve_by_id_view import user_retrieve_by_id_view
from recipeyak.api.user_retrieve_view import user_retrieve_view
from recipeyak.api.user_update_view import user_update_view
from recipeyak.api.user_uploads_list_view import user_uploads_list_view

routes = [
    route(
        "api/v1/t/<int:team_id>/members/",
        method="get",
        view=member_list_view,
    ),
    route(
        "api/v1/members/<int:member_id>/",
        method="delete",
        view=member_delete_view,
    ),
    route(
        "api/v1/members/<int:member_id>/",
        method="patch",
        view=member_update_view,
    ),
    route(
        "api/v1/auth/login/",
        method="post",
        view=user_login_view,
    ),
    route(
        "api/v1/auth/logout/",
        method="post",
        view=user_logout_view,
    ),
    route(
        "api/v1/auth/ably/",
        method="get",
        view=ably_retrieve_view,
    ),
    route(
        "api/v1/auth/algolia/",
        method="get",
        view=algolia_retrieve_view,
    ),
    route(
        "api/v1/auth/password/change/",
        method="post",
        view=user_password_update_view,
    ),
    route(
        "api/v1/auth/password/reset/",
        method="post",
        view=user_password_reset_view,
    ),
    route(
        "api/v1/auth/password/reset/confirm/",
        method="post",
        view=user_password_reset_confirm_view,
    ),
    route(
        "api/v1/auth/registration/",
        method="post",
        view=user_create_view,
    ),
    route(
        "api/v1/cook-checklist/<int:recipe_id>/",
        method="get",
        view=cook_checklist_retrieve_view,
    ),
    route(
        "api/v1/cook-checklist/<int:recipe_id>/",
        method="post",
        view=cook_checklist_create_view,
    ),
    route(
        "api/v1/invites/",
        method="get",
        view=invite_list_view,
    ),
    route(
        "api/v1/invites/<int:invite_id>/accept/",
        method="post",
        view=invite_accept_view,
    ),
    route(
        "api/v1/invites/<int:invite_id>/decline/",
        method="post",
        view=invite_decline_view,
    ),
    route(
        "api/v1/t/<int:team_id>/invites/",
        method="post",
        view=invite_create_view,
    ),
    route(
        "api/v1/t/<int:team_id>/",
        method="patch",
        view=team_update_view,
    ),
    route(
        "api/v1/t/<int:team_id>/",
        method="get",
        view=team_retrieve_view,
    ),
    route(
        "api/v1/t/<int:team_id>/",
        method="delete",
        view=team_delete_view,
    ),
    route(
        "api/v1/t/",
        method="get",
        view=team_list_view,
    ),
    route(
        "api/v1/t/",
        method="post",
        view=team_create_view,
    ),
    route(
        "api/v1/notes/<str:note_id>/",
        method="patch",
        view=note_update_view,
    ),
    route(
        "api/v1/notes/<str:note_id>/",
        method="delete",
        view=note_delete_view,
    ),
    route(
        "api/v1/notes/<str:note_id>/reactions/",
        method="post",
        view=reaction_create_view,
    ),
    route(
        "api/v1/reactions/<str:reaction_id>/",
        method="delete",
        view=reaction_delete_view,
    ),
    route(
        "api/v1/recipes/",
        method="post",
        view=recipe_create_view,
    ),
    route(
        "api/v1/recipes/<int:recipe_id>/",
        method="get",
        view=recipe_retrieve_view,
    ),
    route(
        "api/v1/recipes/<int:recipe_id>/",
        method="patch",
        view=recipe_update_view,
    ),
    route(
        "api/v1/recipes/<int:recipe_id>/",
        method="delete",
        view=recipe_delete_view,
    ),
    # TODO: maybe this should be:
    #   POST api/v1/ingredients/
    # and the recipe_id should be in the params
    # ditto for similar method setups
    route(
        "api/v1/recipes/<int:recipe_id>/ingredients/",
        method="post",
        view=ingredient_create_view,
    ),
    route(
        "api/v1/ingredients/<int:ingredient_id>/",
        method="patch",
        view=ingredient_update_view,
    ),
    route(
        "api/v1/ingredients/<int:ingredient_id>/",
        method="delete",
        view=ingredient_delete_view,
    ),
    route(
        "api/v1/recipes/<int:recipe_id>/notes/",
        method="post",
        view=note_create_view,
    ),
    route(
        "api/v1/recipes/<int:recipe_id>/sections",
        method="post",
        view=section_create_view,
    ),
    route(
        "api/v1/recipes/<int:recipe_id>/steps/",
        method="post",
        view=step_create_view,
    ),
    route(
        "api/v1/steps/<int:step_id>/",
        method="patch",
        view=step_update_view,
    ),
    route(
        "api/v1/steps/<int:step_id>/",
        method="delete",
        view=step_delete_view,
    ),
    route(
        "api/v1/recipes/<int:recipe_id>/timeline",
        method="get",
        view=recipe_timeline_view,
    ),
    route(
        "api/v1/recipes/recently_viewed",
        method="get",
        view=recipe_recently_viewed_view,
    ),
    route(
        "api/v1/recipes/recently_created",
        method="get",
        view=recipe_recently_created_view,
    ),
    route(
        "api/v1/sections/<int:section_id>/",
        method="delete",
        view=section_delete_view,
    ),
    route(
        "api/v1/sections/<int:section_id>/",
        method="patch",
        view=section_update_view,
    ),
    route(
        "api/v1/sessions/",
        method="delete",
        view=session_delete_all_view,
    ),
    route(
        "api/v1/sessions/",
        method="get",
        view=session_list_view,
    ),
    route(
        "api/v1/sessions/<str:session_id>/",
        method="delete",
        view=session_delete_view,
    ),
    route(
        "api/v1/calendars/",
        method="get",
        view=calendars_list_view,
    ),
    route(
        "api/v1/calendars/",
        method="post",
        view=calendar_create_view,
    ),
    route(
        "api/v1/calendars/<int:calendar_id>/",
        method="delete",
        view=calendar_delete_view,
    ),
    route(
        "api/v1/calendars/<int:calendar_id>/pin/",
        method="post",
        view=calendar_pin_create_view,
    ),
    route(
        "api/v1/calendar/",
        method="get",
        view=calendar_list_view,
    ),
    route(
        "api/v1/calendar/",
        method="post",
        view=scheduled_recipe_create_view,
    ),
    route(
        "api/v1/calendar/settings/",
        method="get",
        view=calendar_settings_retrieve_view,
    ),
    route(
        "api/v1/calendar/settings/",
        method="patch",
        view=calendar_update_settings_view,
    ),
    route(
        "api/v1/calendar/generate_link/",
        method="post",
        view=calendar_generate_link_view,
    ),
    route(
        "api/v1/calendar/<int:scheduled_recipe_id>/",
        method="patch",
        view=calendar_update_view,
    ),
    route(
        "api/v1/calendar/<int:scheduled_recipe_id>/",
        method="delete",
        view=calendar_event_delete_view,
    ),
    route(
        "api/v1/shoppinglist/",
        method="get",
        view=shoppinglist_retrieve_view,
    ),
    route(
        "api/v1/upload/",
        method="post",
        view=upload_start_view,
    ),
    route(
        "api/v1/upload/<int:upload_id>/complete",
        method="post",
        view=upload_complete_view,
    ),
    route(
        "api/v1/user/",
        method="get",
        view=user_retrieve_view,
    ),
    route(
        "api/v1/user/",
        method="patch",
        view=user_update_view,
    ),
    route(
        "api/v1/user/",
        method="delete",
        view=user_delete_view,
    ),
    route(
        "api/v1/user/<str:user_id>/",
        method="get",
        view=user_retrieve_by_id_view,
    ),
    route(
        "api/v1/user/<str:user_id>/comments/",
        method="get",
        view=user_comments_list_view,
    ),
    route(
        "api/v1/user/<str:user_id>/uploads/",
        method="get",
        view=user_uploads_list_view,
    ),
    route(
        "t/<int:team_id>/ical/<str:ical_id>/schedule.ics",
        method=("get", "head"),
        view=ical_retrieve_view,
    ),
    route(
        "t/<int:team_id>/ical/<str:ical_id>/calendar/<int:calendar_id>/schedule.ics",
        method=("get", "head"),
        view=ical_retrieve_view,
    ),
    route(
        r"^api/v1/bot-recipes/(?P<recipe_id>[0-9]+)(-.*)?$",
        method="get",
        view=recipe_bot_detail_view,
        regex=True,
    ),
    route(
        r"^recipes.(?P<filetype>json|yaml|yml)$",
        method="get",
        view=export_recipes_list_view,
        regex=True,
    ),
    route(
        r"^recipes/(?P<pk>[0-9]+)\.(?P<filetype>json|yaml|yml)$",
        method="get",
        view=export_recipes_list_view,
        regex=True,
    ),
]

urlpatterns = create_urlpatterns(*routes)
