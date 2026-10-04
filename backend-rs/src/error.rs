use axum::Json;
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use serde_json::json;

/// Errors returned from handlers.
///
/// Rendered in the same shape as the Django backend's `APIError` so the
/// frontend can't tell which backend served the request.
#[derive(Debug, thiserror::Error)]
pub enum ApiError {
    #[error("Authentication credentials were not provided.")]
    NotAuthenticated,
    #[error("Not found.")]
    NotFound,
    #[error(transparent)]
    Database(#[from] sqlx::Error),
}

impl ApiError {
    fn status(&self) -> StatusCode {
        match self {
            // Django returns a 403 rather than a 401 for unauthenticated requests.
            Self::NotAuthenticated => StatusCode::FORBIDDEN,
            Self::NotFound => StatusCode::NOT_FOUND,
            Self::Database(_) => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }

    fn code(&self) -> &'static str {
        match self {
            Self::NotAuthenticated => "not_authenticated",
            Self::NotFound => "not_found",
            Self::Database(_) => "internal_error",
        }
    }
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        let message = match &self {
            Self::Database(err) => {
                tracing::error!(error = %err, "database error");
                "Internal server error.".to_owned()
            }
            _ => self.to_string(),
        };
        let body = json!({
            "error": {
                "message": message,
                "code": self.code(),
            },
            "message": message,
            "non_field_errors": [message],
        });
        (self.status(), Json(body)).into_response()
    }
}
