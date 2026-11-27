//! A pooled connection for the handler, so handlers take `db: Db` instead of
//! `State(state)` and `state.pool.get()`.
//!
//! Put it after `User`, `Team` and `Calendar` in the handler's arguments.
//! Extractors run in order and those check out a connection of their own, so
//! a `Db` before them holds two connections at once.

use axum::extract::FromRequestParts;
use axum::http::request::Parts;

use crate::AppState;
use crate::db::Db;
use crate::error::ApiError;

impl FromRequestParts<AppState> for Db {
    type Rejection = ApiError;

    async fn from_request_parts(
        _parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        Ok(state.pool.get().await?)
    }
}
