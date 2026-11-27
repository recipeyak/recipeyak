//! Error responses matching `recipeyak.api.base.middleware.ExceptionMiddleware`.

use std::fmt::{Debug, Display};

use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use serde_json::json;

#[derive(Debug)]
pub enum ApiError {
    Validation(String),
    Api {
        code: &'static str,
        message: &'static str,
        status: StatusCode,
    },
    NotFound,
    /// Logged and reported to Sentry, and a bare 500 to the client.
    Internal(anyhow::Error),
}

impl ApiError {
    pub fn validation(message: impl Into<String>) -> Self {
        ApiError::Validation(message.into())
    }

    /// An `APIError(code=..., message=...)` with Django's default status.
    pub fn bad_request(code: &'static str, message: &'static str) -> Self {
        ApiError::Api {
            code,
            message,
            status: StatusCode::BAD_REQUEST,
        }
    }

    pub fn internal(message: impl Display + Debug + Send + Sync + 'static) -> Self {
        ApiError::Internal(anyhow::Error::msg(message))
    }

    pub fn not_authenticated() -> Self {
        ApiError::Api {
            code: "not_authenticated",
            message: "Authentication credentials were not provided.",
            status: StatusCode::FORBIDDEN,
        }
    }
}

/// Lets `?` turn any error into a 500. `ApiError` isn't a `std::error::Error`
/// itself, so this doesn't overlap with `From<ApiError> for ApiError`.
impl<E: Into<anyhow::Error>> From<E> for ApiError {
    fn from(err: E) -> Self {
        ApiError::Internal(err.into())
    }
}

/// `.or_not_found()?` for queries that return no row when the object doesn't
/// exist or isn't visible to the user, like `get_object_or_404`.
pub trait OrNotFound<T> {
    fn or_not_found(self) -> Result<T, ApiError>;
}

impl<T> OrNotFound<T> for Option<T> {
    fn or_not_found(self) -> Result<T, ApiError> {
        self.ok_or(ApiError::NotFound)
    }
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        match self {
            ApiError::Validation(message) => (
                StatusCode::BAD_REQUEST,
                axum::Json(json!({
                    "error": {"message": message, "code": "validation_error"},
                    "message": message,
                })),
            )
                .into_response(),
            ApiError::Api {
                code,
                message,
                status,
            } => (
                status,
                axum::Json(json!({
                    "error": {"message": message, "code": code},
                    "message": message,
                    "non_field_errors": [message],
                })),
            )
                .into_response(),
            ApiError::NotFound => StatusCode::NOT_FOUND.into_response(),
            ApiError::Internal(err) => {
                // `:#` includes the causes.
                tracing::error!(error = %format_args!("{err:#}"), "internal server error");
                StatusCode::INTERNAL_SERVER_ERROR.into_response()
            }
        }
    }
}
