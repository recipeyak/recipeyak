//! JSON request bodies and responses.
//!
//! Like Django's `Params.parse_raw`, the body is parsed whatever its
//! `Content-Type`, and failures are a `validation_error` rather than axum's
//! plain text 415 or 422.

use axum::body::Bytes;
use axum::extract::{FromRequest, Request};
use axum::response::{IntoResponse, Response};
use serde::Serialize;
use serde::de::DeserializeOwned;

use crate::error::ApiError;

pub struct Json<T>(pub T);

impl<T, S> FromRequest<S> for Json<T>
where
    T: DeserializeOwned,
    S: Send + Sync,
{
    type Rejection = ApiError;

    async fn from_request(request: Request, state: &S) -> Result<Self, Self::Rejection> {
        let body = Bytes::from_request(request, state)
            .await
            .map_err(|err| ApiError::Validation(err.body_text()))?;
        serde_json::from_slice(&body)
            .map(Json)
            .map_err(|err| ApiError::Validation(err.to_string()))
    }
}

impl<T: Serialize> IntoResponse for Json<T> {
    fn into_response(self) -> Response {
        axum::Json(self.0).into_response()
    }
}
