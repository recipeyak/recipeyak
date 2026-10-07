//! Error responses matching `recipeyak.api.base.middleware.ExceptionMiddleware`
//! and Django's default 404/500 handlers.

use axum::http::{StatusCode, header};
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

impl From<sqlx::Error> for ApiError {
    fn from(err: sqlx::Error) -> Self {
        ApiError::Internal(err.to_string())
    }
}

const NOT_FOUND_HTML: &str = "<!doctype html>\n<html lang=\"en\">\n<head>\n  <title>Not Found</title>\n</head>\n<body>\n  <h1>Not Found</h1><p>The requested resource was not found on this server.</p>\n</body>\n</html>\n";
const SERVER_ERROR_HTML: &str = "<!doctype html>\n<html lang=\"en\">\n<head>\n  <title>Server Error (500)</title>\n</head>\n<body>\n  <h1>Server Error (500)</h1><p></p>\n</body>\n</html>\n";

pub fn not_found() -> Response {
    html(StatusCode::NOT_FOUND, NOT_FOUND_HTML)
}

fn html(status: StatusCode, body: &'static str) -> Response {
    (
        status,
        [(header::CONTENT_TYPE, "text/html; charset=utf-8")],
        body,
    )
        .into_response()
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
            ApiError::NotFound => not_found(),
            ApiError::Internal(err) => {
                tracing::error!(error = %err, "internal server error");
                html(StatusCode::INTERNAL_SERVER_ERROR, SERVER_ERROR_HTML)
            }
        }
    }
}
