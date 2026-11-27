mod calendars_list;
mod create;
mod delete;
mod event_delete;
mod list;
mod pin_create;
mod scheduled_recipe_create;
mod settings;
mod update;

pub mod scheduled_recipe;

use utoipa_axum::router::OpenApiRouter;
use utoipa_axum::routes;

use crate::AppState;

/// Handlers that share a path have to be in the same `routes!`.
pub fn router() -> OpenApiRouter<AppState> {
    OpenApiRouter::new()
        .routes(routes!(
            list::list_view,
            scheduled_recipe_create::scheduled_recipe_create_view
        ))
        .routes(routes!(
            calendars_list::calendars_list_view,
            create::create_view
        ))
        .routes(routes!(delete::delete_view))
        .routes(routes!(pin_create::pin_create_view))
        .routes(routes!(
            settings::settings_retrieve_view,
            settings::update_settings_view
        ))
        .routes(routes!(settings::generate_link_view))
        .routes(routes!(
            update::update_view,
            event_delete::event_delete_view
        ))
}
