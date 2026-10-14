//! Routes that are part of the UI's API and included in the OpenAPI schema.

pub mod calendar;

use utoipa_axum::router::OpenApiRouter;

use crate::AppState;

pub fn router() -> OpenApiRouter<AppState> {
    OpenApiRouter::new().merge(calendar::router())
}
