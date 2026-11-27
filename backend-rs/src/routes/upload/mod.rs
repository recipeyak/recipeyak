mod complete;
mod start;

use utoipa_axum::router::OpenApiRouter;
use utoipa_axum::routes;

use crate::AppState;

pub fn router() -> OpenApiRouter<AppState> {
    OpenApiRouter::new()
        .routes(routes!(start::start_view))
        .routes(routes!(complete::complete_view))
}
