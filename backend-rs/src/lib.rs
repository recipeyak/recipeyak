pub mod config;
mod error;
mod extract;
mod middleware;
mod routes;
mod urls;

use std::sync::Arc;
use std::time::Duration;

use axum::Router;
use axum::extract::State;
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::routing::get;
use deadpool_postgres::Pool;
use tower_http::timeout::TimeoutLayer;
use tower_http::trace::{DefaultMakeSpan, DefaultOnResponse, TraceLayer};
use tracing::Level;

use crate::config::Config;

#[derive(Clone)]
pub struct AppState {
    pub pool: Pool,
    pub config: Arc<Config>,
}

pub fn openapi() -> utoipa::openapi::OpenApi {
    let (_, mut api) = routes::router().split_for_parts();
    api.info = utoipa::openapi::Info::new("RecipeYak API", "1.0.0");
    api
}

pub fn app(state: AppState) -> Router {
    let (api, _) = routes::router().split_for_parts();
    api.route("/healthz", get(|| async { "OK" }))
        .route("/readiness", get(readiness))
        .fallback(|| async { error::not_found() })
        // Innermost so the timeout response still gets the headers and
        // tracing below. Dropping the handler doesn't cancel its in-flight
        // Postgres query.
        .layer(TimeoutLayer::with_status_code(
            StatusCode::SERVICE_UNAVAILABLE,
            Duration::from_secs(30),
        ))
        .layer(axum::middleware::from_fn(middleware::vary_cookie))
        .layer(axum::middleware::from_fn(middleware::security))
        .layer(axum::middleware::from_fn(middleware::no_cache))
        .layer(axum::middleware::from_fn(middleware::server_timing))
        .layer(
            TraceLayer::new_for_http()
                .make_span_with(DefaultMakeSpan::new().level(Level::INFO))
                .on_response(DefaultOnResponse::new().level(Level::INFO)),
        )
        .with_state(state)
}

async fn readiness(State(state): State<AppState>) -> Response {
    let result = async {
        let client = state.pool.get().await?;
        client.query_one("SELECT 1", &[]).await?;
        Ok::<_, Box<dyn std::error::Error>>(())
    };
    match result.await {
        Ok(_) => "OK".into_response(),
        Err(err) => {
            tracing::error!(error = %err, "could not connect to postgres");
            // ReadinessError.PG_CANNOT_CONNECT
            (StatusCode::INTERNAL_SERVER_ERROR, "2").into_response()
        }
    }
}
