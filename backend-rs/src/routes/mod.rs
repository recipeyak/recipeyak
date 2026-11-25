//! Routes that are part of the UI's API and included in the OpenAPI schema.

pub mod calendar;
pub mod note;
pub mod reaction;
pub mod upload;

use utoipa_axum::router::OpenApiRouter;
use utoipa_axum::routes;

use crate::AppState;

pub fn router() -> OpenApiRouter<AppState> {
    OpenApiRouter::new()
        .routes(routes!(
            calendar::list_view,
            calendar::scheduled_recipe_create_view
        ))
        .routes(routes!(
            calendar::calendars_list_view,
            calendar::create_view
        ))
        .routes(routes!(calendar::delete_view))
        .routes(routes!(calendar::pin_create_view))
        .routes(routes!(
            calendar::settings_retrieve_view,
            calendar::update_settings_view
        ))
        .routes(routes!(calendar::generate_link_view))
        .routes(routes!(calendar::update_view, calendar::event_delete_view))
        .routes(routes!(upload::start_view))
        .routes(routes!(upload::complete_view))
        .routes(routes!(note::create_view))
        .routes(routes!(note::update_view, note::delete_view))
        .routes(routes!(reaction::create_view))
        .routes(routes!(reaction::delete_view))
}
