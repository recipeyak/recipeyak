//! Routes that are part of the UI's API and included in the OpenAPI schema.
//! Each area registers its own handlers in its `router()`.

pub mod calendar;
pub mod upload;

use utoipa_axum::router::OpenApiRouter;

use crate::AppState;

pub fn router() -> OpenApiRouter<AppState> {
    OpenApiRouter::new()
        .merge(calendar::router())
        .merge(upload::router())
}
