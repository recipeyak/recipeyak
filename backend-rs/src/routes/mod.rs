mod recipe_recently_viewed;

use axum::Router;
use axum::routing::get;

use crate::AppState;

pub fn router() -> Router<AppState> {
    Router::new().route("/healthz", get(healthz)).route(
        "/api/v1/recipes/recently_viewed",
        get(recipe_recently_viewed::recipe_recently_viewed),
    )
}

async fn healthz() -> &'static str {
    "OK"
}
