from recipeyak.api.ably_detail_view import ably_detail_view
from recipeyak.api.algolia_detail_view import algolia_detail_view
from recipeyak.api.base.router import route, routes
from recipeyak.api.calendar_delete_view import calendar_delete_view
from recipeyak.api.calendar_generate_link_view import generate_link
from recipeyak.api.calendar_list_get_view import calendar_list_get_view
from recipeyak.api.calendar_next_open_view import next_open
from recipeyak.api.calendar_update_settings_view import update_settings
from recipeyak.api.calendar_update_view import calendar_update_view
from recipeyak.api.cook_checklist_create_view import cook_checklist_create_view
from recipeyak.api.cook_checklist_get_view import cook_checklist_get_view
from recipeyak.api.export_recipes_list_view import export_recipes_list_view
from recipeyak.api.ical_detail_view import get_ical_view
from recipeyak.api.ingredient_delete_view import ingredient_delete_view
from recipeyak.api.ingredient_update_view import ingredient_update_view
from recipeyak.api.ingredients_create_view import ingredients_create_view
from recipeyak.api.login_user_detail_view import login_user_detail_view
from recipeyak.api.logout_user_detail_view import logout_user_detail_view
from recipeyak.api.note_create_view import note_create_view
from recipeyak.api.note_delete_view import note_delete_view
from recipeyak.api.note_update_view import note_update_view
from recipeyak.api.password_change_detail_view import password_change_detail_view
from recipeyak.api.password_reset_confirm_view import password_reset_confirm_view
from recipeyak.api.password_reset_view import password_reset_view
from recipeyak.api.reaction_create_view import reaction_create_view
from recipeyak.api.reaction_delete_view import reaction_delete_view
from recipeyak.api.recently_created_recipes_view import get_recently_created_recipes
from recipeyak.api.recently_view_recipes_view import get_recently_viewed_recipes
from recipeyak.api.recipe_bot_detail_view import recipe_bot_detail_view
from recipeyak.api.recipe_create_view import recipe_create_view
from recipeyak.api.recipe_delete_view import recipe_delete_view
from recipeyak.api.recipe_get_view import recipe_get_view
from recipeyak.api.recipe_list_get_view import recipe_list_get_view
from recipeyak.api.recipe_update_view import recipe_update_view
from recipeyak.api.register_user_detail_view import register_user_detail_view
from recipeyak.api.scheduled_recipe_create import scheduled_recipe_create_view
from recipeyak.api.search_click_create_view import search_click_create_view
from recipeyak.api.section_create_view import create_section_view
from recipeyak.api.section_delete_view import section_delete_view
from recipeyak.api.section_update_view import section_update_view
from recipeyak.api.session_delete_all_view import session_delete_all_view
from recipeyak.api.session_list_view import session_list_view
from recipeyak.api.sessions_detail_view import sessions_detail_view
from recipeyak.api.step_delete_view import step_delete_view
from recipeyak.api.step_update_view import step_update_view
from recipeyak.api.steps_list_view import steps_list_view
from recipeyak.api.team_create_view import team_create_view
from recipeyak.api.team_delete_view import team_delete_view
from recipeyak.api.team_get_view import team_get_view
from recipeyak.api.team_invite_list_view import team_invite_list_view
from recipeyak.api.team_list_get_view import team_list_get_view
from recipeyak.api.team_member_delete_view import team_member_delete_view
from recipeyak.api.team_member_update_view import team_member_update_view
from recipeyak.api.team_members_list_view import team_members_list_view
from recipeyak.api.team_shopping_list_detail_view import get_shopping_list_view
from recipeyak.api.team_update_view import team_update_view
from recipeyak.api.timeline_view import get_recipe_timeline
from recipeyak.api.uploads_detail_view import complete_upload_view
from recipeyak.api.uploads_list_view import start_upload_view
from recipeyak.api.user_delete_view import user_delete_view
from recipeyak.api.user_detail_by_id_view import user_detail_by_id_view
from recipeyak.api.user_get_view import user_get_view
from recipeyak.api.user_invites_accept_view import user_invites_accept_view
from recipeyak.api.user_invites_decline_view import user_invites_decline_view
from recipeyak.api.user_invites_list_view import user_invites_list_view
from recipeyak.api.user_update_view import user_patch_view

urlpatterns = routes(
    route(
        "api/v1/t/<int:team_id>/members/",
        method="get",
        view=team_members_list_view,
    ),
    route(
        "api/v1/t/<int:team_id>/members/<int:member_id>/",
        method="delete",
        view=team_member_delete_view,
    ),
    route(
        "api/v1/t/<int:team_id>/members/<int:member_id>/",
        method="patch",
        view=team_member_update_view,
    ),
    route(
        "api/v1/auth/login/",
        method="post",
        view=login_user_detail_view,
    ),
    route(
        "api/v1/auth/logout/",
        method="post",
        view=logout_user_detail_view,
    ),
    route(
        "api/v1/auth/ably/",
        method="get",
        view=ably_detail_view,
    ),
    route(
        "api/v1/auth/algolia/",
        method="get",
        view=algolia_detail_view,
    ),
    route(
        "api/v1/auth/password/change/",
        method="post",
        view=password_change_detail_view,
    ),
    route(
        "api/v1/auth/password/reset/",
        method="post",
        view=password_reset_view,
    ),
    route(
        "api/v1/auth/password/reset/confirm/",
        method="post",
        view=password_reset_confirm_view,
    ),
    route(
        "api/v1/auth/registration/",
        method="post",
        view=register_user_detail_view,
    ),
    route(
        "api/v1/cook-checklist/<int:recipe_id>/",
        method="get",
        view=cook_checklist_get_view,
    ),
    route(
        "api/v1/cook-checklist/<int:recipe_id>/",
        method="post",
        view=cook_checklist_create_view,
    ),
    route(
        "api/v1/invites/",
        method="get",
        view=user_invites_list_view,
    ),
    route(
        "api/v1/invites/<int:invite_id>/accept/",
        method="post",
        view=user_invites_accept_view,
    ),
    route(
        "api/v1/invites/<int:invite_id>/decline/",
        method="post",
        view=user_invites_decline_view,
    ),
    route(
        "api/v1/t/<int:team_id>/invites/",
        method="post",
        view=team_invite_list_view,
    ),
    route(
        "api/v1/t/<int:team_id>/",
        method="patch",
        view=team_update_view,
    ),
    route(
        "api/v1/t/<int:team_id>/",
        method="get",
        view=team_get_view,
    ),
    route(
        "api/v1/t/<int:team_id>/",
        method="delete",
        view=team_delete_view,
    ),
    route(
        "api/v1/t/",
        method="get",
        view=team_list_get_view,
    ),
    route(
        "api/v1/t/",
        method="post",
        view=team_create_view,
    ),
    route(
        "api/v1/notes/<int:note_id>/",
        method="patch",
        view=note_update_view,
    ),
    route(
        "api/v1/notes/<int:note_id>/",
        method="delete",
        view=note_delete_view,
    ),
    route(
        "api/v1/notes/<int:note_id>/reactions/",
        method="post",
        view=reaction_create_view,
    ),
    route(
        "api/v1/reactions/<int:reaction_id>/",
        method="delete",
        view=reaction_delete_view,
    ),
    route(
        "api/v1/recipes/",
        method="get",
        view=recipe_list_get_view,
    ),
    route(
        "api/v1/recipes/",
        method="post",
        view=recipe_create_view,
    ),
    route(
        "api/v1/recipes/<int:recipe_id>/",
        method="get",
        view=recipe_get_view,
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
    route(
        "api/v1/recipes/<int:recipe_id>/ingredients/",
        method="post",
        view=ingredients_create_view,
    ),
    route(
        # TODO: remove recipe_id
        "api/v1/recipes/<int:recipe_id>/ingredients/<int:ingredient_id>/",
        method="patch",
        view=ingredient_update_view,
    ),
    route(
        # TODO: remove recipe_id
        "api/v1/recipes/<int:recipe_id>/ingredients/<int:ingredient_id>/",
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
        view=create_section_view,
    ),
    route(
        "api/v1/recipes/<int:recipe_id>/steps/",
        method="post",
        view=steps_list_view,
    ),
    route(
        # TODO: remove recipe_id id
        "api/v1/recipes/<int:recipe_id>/steps/<int:step_id>/",
        method="patch",
        view=step_update_view,
    ),
    route(
        # TODO: remove recipe_id id
        "api/v1/recipes/<int:recipe_id>/steps/<int:step_id>/",
        method="delete",
        view=step_delete_view,
    ),
    route(
        "api/v1/recipes/<int:recipe_id>/timeline",
        method="get",
        view=get_recipe_timeline,
    ),
    route(
        "api/v1/recipes/recently_viewed",
        method="get",
        view=get_recently_viewed_recipes,
    ),
    route(
        "api/v1/recipes/recently_created",
        method="get",
        view=get_recently_created_recipes,
    ),
    route(
        "api/v1/search-click/",
        method="post",
        view=search_click_create_view,
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
        view=sessions_detail_view,
    ),
    route(
        "api/v1/t/<int:team_id>/calendar/",
        method="get",
        view=calendar_list_get_view,
    ),
    route(
        "api/v1/t/<int:team_id>/calendar/",
        method="post",
        view=scheduled_recipe_create_view,
    ),
    route(
        "api/v1/calendar/",
        method="get",
        view=calendar_list_get_view,
    ),
    route(
        "api/v1/calendar/",
        method="post",
        view=scheduled_recipe_create_view,
    ),
    route(
        "api/v1/t/<int:team_id>/calendar/settings/",
        method="patch",
        view=update_settings,
    ),
    route(
        "api/v1/calendar/settings/",
        method="patch",
        view=update_settings,
    ),
    route(
        "api/v1/t/<int:team_id>/calendar/next_open/",
        method="get",
        view=next_open,
    ),
    route(
        "api/v1/calendar/next_open/",
        method="get",
        view=next_open,
    ),
    route(
        "api/v1/t/<int:team_id>/calendar/generate_link/",
        method="post",
        view=generate_link,
    ),
    route(
        "api/v1/calendar/generate_link/",
        method="post",
        view=generate_link,
    ),
    route(
        "api/v1/t/<int:team_id>/calendar/<int:scheduled_recipe_id>/",
        method="patch",
        view=calendar_update_view,
    ),
    route(
        "api/v1/t/<int:team_id>/calendar/<int:scheduled_recipe_id>/",
        method="delete",
        view=calendar_delete_view,
    ),
    route(
        "api/v1/calendar/<int:scheduled_recipe_id>/",
        method="patch",
        view=calendar_update_view,
    ),
    route(
        "api/v1/calendar/<int:scheduled_recipe_id>/",
        method="delete",
        view=calendar_delete_view,
    ),
    route(
        "api/v1/t/<int:team_id>/shoppinglist/",
        method="get",
        view=get_shopping_list_view,
    ),
    route(
        "api/v1/shoppinglist/",
        method="get",
        view=get_shopping_list_view,
    ),
    route(
        "api/v1/upload/",
        method="post",
        view=start_upload_view,
    ),
    route(
        "api/v1/upload/<int:upload_id>/complete",
        method="post",
        view=complete_upload_view,
    ),
    route(
        "api/v1/user/",
        method="get",
        view=user_get_view,
    ),
    route(
        "api/v1/user/",
        method="patch",
        view=user_patch_view,
    ),
    route(
        "api/v1/user/",
        method="delete",
        view=user_delete_view,
    ),
    route(
        "api/v1/user/<str:user_id>/",
        method="get",
        view=user_detail_by_id_view,
    ),
    # TODO: figure out how to have multiple methods for a path
    route(
        "t/<int:team_id>/ical/<str:ical_id>/schedule.ics",
        method=("get", "head"),
        view=get_ical_view,
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
)
