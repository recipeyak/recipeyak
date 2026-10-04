pub mod auth;
pub mod config;
pub mod django;
pub mod error;
mod json;
mod routes;
mod storage;
mod team;

use std::sync::Arc;

use axum::Router;
use axum::http::{HeaderValue, Request, header};
use sqlx::PgPool;
use tower_http::set_header::SetResponseHeaderLayer;
use tower_http::trace::{DefaultOnResponse, TraceLayer};
use tracing::Level;

use crate::config::Config;

#[derive(Clone)]
pub struct AppState {
    pub pool: PgPool,
    pub config: Arc<Config>,
}

/// The OpenAPI spec for the routes served by [`app`].
pub fn openapi() -> utoipa::openapi::OpenApi {
    routes::router().into_openapi()
}

pub fn app(state: AppState) -> Router {
    let (router, _) = routes::router().split_for_parts();
    router
        .with_state(state)
        // Match Django's `NoCacheMiddleware`.
        .layer(SetResponseHeaderLayer::if_not_present(
            header::CACHE_CONTROL,
            HeaderValue::from_static("no-store, no-cache, must-revalidate"),
        ))
        .layer(
            TraceLayer::new_for_http()
                .make_span_with(|request: &Request<_>| {
                    // nginx sets `X-Request-Id`
                    let request_id = request
                        .headers()
                        .get("x-request-id")
                        .and_then(|v| v.to_str().ok())
                        .unwrap_or_default();
                    tracing::info_span!(
                        "request",
                        method = %request.method(),
                        uri = %request.uri(),
                        request_id,
                    )
                })
                .on_response(DefaultOnResponse::new().level(Level::INFO)),
        )
}
