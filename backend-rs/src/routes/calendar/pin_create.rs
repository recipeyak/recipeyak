//! Port of `recipeyak.api.calendar_pin_create_view`.
//!
//! POST /api/v1/calendars/{calendar_id}/pin/

use axum::extract::{Path, State};
use axum::http::StatusCode;
use cornucopia::queries::calendar::pin_calendar;

use crate::AppState;
use crate::error::ApiError;
use crate::extract::team::Team;
use crate::extract::user::User;

#[utoipa::path(
    post,
    path = "/api/v1/calendars/{calendar_id}/pin/",
    operation_id = "CalendarPinCreate",
    params(("calendar_id" = i32, Path)),
    responses((status = 204, description = "No content")),
)]
pub async fn calendar_pin_create_view(
    State(state): State<AppState>,
    user: User,
    team: Team,
    Path(calendar_id): Path<i32>,
) -> Result<StatusCode, ApiError> {
    let client = state.pool.get().await?;
    pin_calendar()
        .bind(&client, &user.id, &calendar_id, &team.id)
        .opt()
        .await?
        // Django 500s with Calendar.DoesNotExist.
        .ok_or(ApiError::NotFound)?;

    Ok(StatusCode::NO_CONTENT)
}
