//! Path params that 404 when they don't parse, like Django's `<int:...>` URL
//! patterns, rather than axum's plain text 400.

use axum::extract::FromRequestParts;
use axum::extract::rejection::PathRejection;
use axum::http::request::Parts;
use serde::de::DeserializeOwned;

use crate::error::ApiError;

pub struct Path<T>(pub T);

impl<T, S> FromRequestParts<S> for Path<T>
where
    T: DeserializeOwned + Send,
    S: Send + Sync,
{
    type Rejection = ApiError;

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        match axum::extract::Path::from_request_parts(parts, state).await {
            Ok(axum::extract::Path(value)) => Ok(Path(value)),
            Err(PathRejection::FailedToDeserializePathParams(_)) => Err(ApiError::NotFound),
            // The route and the extractor disagree, which is a bug here.
            Err(err) => Err(ApiError::internal(err.body_text())),
        }
    }
}
