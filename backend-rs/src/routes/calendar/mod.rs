mod calendars_list;
mod create;
mod delete;
mod event_delete;
mod list;
mod pin_create;
mod scheduled_recipe_create;
pub mod serialization;
mod settings;
mod update;

use utoipa_axum::router::OpenApiRouter;
use utoipa_axum::routes;

use crate::AppState;

pub fn router() -> OpenApiRouter<AppState> {
    OpenApiRouter::new()
        .routes(routes!(
            list::calendar_list_view,
            scheduled_recipe_create::scheduled_recipe_create_view
        ))
        .routes(routes!(
            calendars_list::calendars_list_view,
            create::calendar_create_view
        ))
        .routes(routes!(delete::calendar_delete_view))
        .routes(routes!(pin_create::calendar_pin_create_view))
        .routes(routes!(
            settings::calendar_settings_retrieve_view,
            settings::calendar_update_settings_view
        ))
        .routes(routes!(settings::calendar_generate_link_view))
        .routes(routes!(
            update::calendar_update_view,
            event_delete::calendar_event_delete_view
        ))
}
