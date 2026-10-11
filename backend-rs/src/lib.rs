pub mod config;
mod error;
mod extract;
mod routes;
mod urls;

use std::sync::Arc;
use std::time::{Instant, SystemTime, UNIX_EPOCH};

use axum::Router;
use axum::extract::{Request, State};
use axum::http::{HeaderValue, StatusCode, header};
use axum::middleware::{self, Next};
use axum::response::{IntoResponse, Response};
use axum::routing::get;
use sqlx::PgPool;

use crate::config::Config;

#[derive(Clone)]
pub struct AppState {
    pub pool: PgPool,
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
        .layer(middleware::from_fn(response_headers))
        .with_state(state)
}

async fn readiness(State(state): State<AppState>) -> Response {
    match sqlx::query_scalar::<_, i32>("SELECT 1")
        .fetch_one(&state.pool)
        .await
    {
        Ok(_) => "OK".into_response(),
        Err(err) => {
            tracing::error!(error = %err, "could not connect to postgres");
            // ReadinessError.PG_CANNOT_CONNECT
            (StatusCode::INTERNAL_SERVER_ERROR, "2").into_response()
        }
    }
}

/// Headers Django's middleware stack adds: NoCacheMiddleware,
/// SecurityMiddleware, XFrameOptionsMiddleware, the session middleware's
/// `Vary: Cookie`, and RequestQueueTimingMiddleware's Server-Timing.
async fn response_headers(request: Request, next: Next) -> Response {
    let start_wall = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs_f64())
        .unwrap_or_default();
    let queue_ms = request
        .headers()
        .get("x-request-start")
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.trim_start_matches("t=").parse::<f64>().ok())
        .map(|request_start| ((start_wall - request_start) * 1000.0).max(0.0));
    let start = Instant::now();

    let mut response = next.run(request).await;

    let app_ms = start.elapsed().as_secs_f64() * 1000.0;
    let mut timing = format!("app;dur={app_ms:.1}");
    if let Some(queue_ms) = queue_ms {
        timing = format!("queue;dur={queue_ms:.1}, {timing}");
    }

    let headers = response.headers_mut();
    if !headers.contains_key(header::CACHE_CONTROL) {
        headers.insert(
            header::CACHE_CONTROL,
            HeaderValue::from_static("no-store, no-cache, must-revalidate"),
        );
        headers.insert(header::PRAGMA, HeaderValue::from_static("no-cache"));
        headers.insert(header::EXPIRES, HeaderValue::from_static("0"));
    }
    headers.insert(header::X_FRAME_OPTIONS, HeaderValue::from_static("DENY"));
    headers.insert(
        header::X_CONTENT_TYPE_OPTIONS,
        HeaderValue::from_static("nosniff"),
    );
    headers.insert(
        header::REFERRER_POLICY,
        HeaderValue::from_static("same-origin"),
    );
    headers.insert(
        "cross-origin-opener-policy",
        HeaderValue::from_static("same-origin"),
    );
    headers.append(header::VARY, HeaderValue::from_static("Cookie"));
    if let Ok(value) = HeaderValue::from_str(&timing) {
        headers.insert("server-timing", value);
    }
    response
}
