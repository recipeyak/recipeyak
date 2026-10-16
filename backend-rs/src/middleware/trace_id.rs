use axum::extract::Request;
use axum::middleware::Next;
use axum::response::Response;

/// Records the Sentry trace id on the request span so console logs can be
/// matched to their Sentry trace. SentryHttpLayer starts the transaction on
/// first poll, after TraceLayer builds its span, so this has to run inside it.
pub async fn trace_id(request: Request, next: Next) -> Response {
    if let Some(span) = sentry::configure_scope(|scope| scope.get_span()) {
        tracing::Span::current().record(
            "trace_id",
            tracing::field::display(span.get_trace_context().trace_id),
        );
    }
    next.run(request).await
}
