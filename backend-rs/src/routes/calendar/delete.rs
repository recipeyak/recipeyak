//! Port of `recipeyak.api.calendar_delete_view`, which isn't implemented in
//! Django either.
//!
//! DELETE /api/v1/calendars/{calendar_id}/

use axum::Json;
use axum::extract::Path;
use serde::Serialize;
use utoipa::ToSchema;

use crate::error::ApiError;
use crate::extract::user::User;

#[derive(Serialize, ToSchema)]
pub struct CalendarDeleteResponse {
    id: i32,
    name: String,
}

#[utoipa::path(
    delete,
    path = "/api/v1/calendars/{calendar_id}/",
    operation_id = "CalendarDelete",
    params(("calendar_id" = i32, Path)),
    responses((status = 200, description = "Successful response.", body = CalendarDeleteResponse)),
)]
pub async fn delete_view(
    _user: User,
    Path(_calendar_id): Path<i32>,
) -> Result<Json<CalendarDeleteResponse>, ApiError> {
    Err(ApiError::Internal(
        "deleting calendars is not implemented".into(),
    ))
}
