pub mod config;
mod db;
mod error;
mod extract;
mod middleware;
mod realtime;
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
use sentry::integrations::tower::{NewSentryLayer, SentryHttpLayer};
use tower_http::timeout::TimeoutLayer;
use tower_http::trace::{DefaultOnFailure, DefaultOnResponse, TraceLayer};
use tracing::Level;

use crate::config::Config;

#[derive(Clone)]
pub struct AppState {
    pub pool: Pool,
    pub config: Arc<Config>,
    pub http: reqwest::Client,
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
        .fallback(|| async { StatusCode::NOT_FOUND })
        // Innermost so the timeout response still gets the headers and
        // tracing below.
        .layer(TimeoutLayer::with_status_code(
            StatusCode::SERVICE_UNAVAILABLE,
            Duration::from_secs(30),
        ))
        // TimeoutLayer doesn't log, and nothing else returns a 503, so this
        // is what reports timeouts to Sentry.
        .layer(axum::middleware::map_response(|response: Response| async {
            if response.status() == StatusCode::SERVICE_UNAVAILABLE {
                tracing::error!("request timed out");
            }
            response
        }))
        .layer(axum::middleware::from_fn(middleware::vary_cookie))
        .layer(axum::middleware::from_fn(middleware::security))
        .layer(axum::middleware::from_fn(middleware::no_cache))
        .layer(axum::middleware::from_fn(middleware::server_timing))
        .layer(axum::middleware::from_fn(middleware::trace_id))
        .layer(
            TraceLayer::new_for_http()
                .make_span_with(|request: &axum::extract::Request| {
                    let request_id = request
                        .headers()
                        .get("x-request-id")
                        .and_then(|v| v.to_str().ok());
                    tracing::info_span!(
                        "request",
                        method = %request.method(),
                        uri = %request.uri(),
                        version = ?request.version(),
                        request_id,
                        trace_id = tracing::field::Empty,
                    )
                })
                .on_response(DefaultOnResponse::new().level(Level::INFO))
                // Errors are logged where they happen, so a failure here would
                // be a duplicate Sentry issue. WARN keeps it as a breadcrumb.
                .on_failure(DefaultOnFailure::new().level(Level::WARN)),
        )
        // Outermost so the request spans above are children of the Sentry
        // transaction. Layers apply bottom-up: bind a hub per request, then
        // start the transaction.
        .layer(SentryHttpLayer::new().enable_transaction())
        .layer(NewSentryLayer::new_from_top())
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
