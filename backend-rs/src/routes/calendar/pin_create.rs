//! Port of `recipeyak.api.calendar_pin_create_view`.
//!
//! POST /api/v1/calendars/{calendar_id}/pin/

use axum::http::StatusCode;
use cornucopia::queries::calendar::pin_calendar;

use crate::db::Db;
use crate::error::{ApiError, OrNotFound};
use crate::extract::Path;
use crate::extract::team::Team;
use crate::extract::user::User;

#[utoipa::path(
    post,
    path = "/api/v1/calendars/{calendar_id}/pin/",
    operation_id = "CalendarPinCreate",
    params(("calendar_id" = i32, Path)),
    responses((status = 204, description = "No content")),
)]
pub async fn pin_create_view(
    user: User,
    team: Team,
    db: Db,
    Path(calendar_id): Path<i32>,
) -> Result<StatusCode, ApiError> {
    pin_calendar()
        .bind(&db, &user.id, &calendar_id, &team.id)
        .opt()
        .await?
        // Django 500s with Calendar.DoesNotExist.
        .or_not_found()?;

    Ok(StatusCode::NO_CONTENT)
}
