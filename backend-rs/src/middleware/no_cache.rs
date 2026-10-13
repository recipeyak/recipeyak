use axum::extract::Request;
use axum::http::{HeaderValue, header};
use axum::middleware::Next;
use axum::response::Response;

/// NoCacheMiddleware: disable caching unless the handler set Cache-Control.
pub async fn no_cache(request: Request, next: Next) -> Response {
    let mut response = next.run(request).await;
    let headers = response.headers_mut();
    if !headers.contains_key(header::CACHE_CONTROL) {
        headers.insert(
            header::CACHE_CONTROL,
            HeaderValue::from_static("no-store, no-cache, must-revalidate"),
        );
        headers.insert(header::PRAGMA, HeaderValue::from_static("no-cache"));
        headers.insert(header::EXPIRES, HeaderValue::from_static("0"));
    }
    response
}
