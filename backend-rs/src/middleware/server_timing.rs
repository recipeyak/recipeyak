use std::time::{Instant, SystemTime, UNIX_EPOCH};

use axum::extract::Request;
use axum::http::HeaderValue;
use axum::middleware::Next;
use axum::response::Response;

/// RequestQueueTimingMiddleware: report time spent queued (from the proxy's
/// `X-Request-Start`) and time spent in the app.
pub async fn server_timing(request: Request, next: Next) -> Response {
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
    if let Some(queue_ms) = queue_ms {
        // Every layer under the Sentry one runs before any child span starts,
        // so the current span here is the request's transaction.
        sentry::configure_scope(|scope| {
            if let Some(span) = scope.get_span() {
                span.set_data("http.server.request.time_in_queue", queue_ms.into());
            }
        });
    }
    let start = Instant::now();

    let mut response = next.run(request).await;

    let app_ms = start.elapsed().as_secs_f64() * 1000.0;
    let mut timing = format!("app;dur={app_ms:.1}");
    if let Some(queue_ms) = queue_ms {
        timing = format!("queue;dur={queue_ms:.1}, {timing}");
    }
    if let Ok(value) = HeaderValue::from_str(&timing) {
        response.headers_mut().insert("server-timing", value);
    }
    response
}
