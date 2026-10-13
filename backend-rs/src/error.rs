//! Error responses matching `recipeyak.api.base.middleware.ExceptionMiddleware`.

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
    Internal(String),
}

impl ApiError {
    pub fn not_authenticated() -> Self {
        ApiError::Api {
            code: "not_authenticated",
            message: "Authentication credentials were not provided.",
            status: StatusCode::FORBIDDEN,
        }
    }
}

impl From<tokio_postgres::Error> for ApiError {
    fn from(err: tokio_postgres::Error) -> Self {
        ApiError::Internal(err.to_string())
    }
}

impl From<deadpool_postgres::PoolError> for ApiError {
    fn from(err: deadpool_postgres::PoolError) -> Self {
        ApiError::Internal(err.to_string())
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
                tracing::error!(error = %err, "internal server error");
                StatusCode::INTERNAL_SERVER_ERROR.into_response()
            }
        }
    }
}
