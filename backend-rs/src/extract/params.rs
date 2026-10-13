//! Query string extractor that reports failures as a `validation_error`.

use axum::extract::{FromRequestParts, Query};
use axum::http::request::Parts;
use serde::de::DeserializeOwned;

use crate::error::ApiError;

pub struct Params<T>(pub T);

impl<T, S> FromRequestParts<S> for Params<T>
where
    T: DeserializeOwned,
    S: Send + Sync,
{
    type Rejection = ApiError;

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let Query(params) = Query::from_request_parts(parts, state)
            .await
            .map_err(|err| ApiError::Validation(err.body_text()))?;
        Ok(Params(params))
    }
}
