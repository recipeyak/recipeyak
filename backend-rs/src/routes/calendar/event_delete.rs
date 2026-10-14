//! Port of `recipeyak.api.calendar_event_delete_view`.
//!
//! DELETE /api/v1/calendar/{scheduled_recipe_id}/

use axum::extract::{Path, State};
use axum::http::StatusCode;
use cornucopia::queries::scheduled_recipe::delete_scheduled_recipe;

use crate::AppState;
use crate::error::ApiError;
use crate::extract::calendar::Calendar;
use crate::realtime::publish_calendar_event_deleted;

#[utoipa::path(
    delete,
    path = "/api/v1/calendar/{scheduled_recipe_id}/",
    operation_id = "CalendarEventDelete",
    params(("scheduled_recipe_id" = i32, Path)),
    responses((status = 204, description = "No content")),
)]
pub async fn event_delete_view(
    State(state): State<AppState>,
    calendar: Calendar,
    Path(scheduled_recipe_id): Path<i32>,
) -> Result<StatusCode, ApiError> {
    let client = state.pool.get().await?;
    delete_scheduled_recipe()
        .bind(
            &client,
            &scheduled_recipe_id,
            &calendar.team_id,
            &calendar.id,
        )
        .await?;

    // Published even if nothing was deleted, like Django.
    publish_calendar_event_deleted(&state, scheduled_recipe_id, calendar.team_id, calendar.id)
        .await;
    Ok(StatusCode::NO_CONTENT)
}
