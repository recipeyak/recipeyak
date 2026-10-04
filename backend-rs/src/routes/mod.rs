mod recipe_recently_viewed;

use axum::routing::get;
use utoipa::OpenApi;
use utoipa_axum::router::OpenApiRouter;
use utoipa_axum::routes;

use crate::AppState;

#[derive(OpenApi)]
#[openapi(
    info(title = "RecipeYak API", version = "1.0.0"),
    servers((url = "https://recipeyak.com")),
)]
struct ApiDoc;

/// API routes, registered via `routes!` so they're included in the OpenAPI spec.
pub fn router() -> OpenApiRouter<AppState> {
    let mut doc = ApiDoc::openapi();
    // utoipa fills these from Cargo.toml, which leaves empty values.
    doc.info.description = None;
    doc.info.license = None;
    OpenApiRouter::with_openapi(doc)
        .route("/healthz", get(healthz))
        .routes(routes!(recipe_recently_viewed::recipe_recently_viewed))
}

async fn healthz() -> &'static str {
    "OK"
}
