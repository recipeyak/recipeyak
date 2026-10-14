//! Port of `recipeyak.api.calendar_update_view`.
//!
//! PATCH /api/v1/calendar/{scheduled_recipe_id}/

use axum::Json;
use axum::extract::{Path, State};
use chrono::NaiveDate;
use cornucopia::queries::scheduled_recipe::{reschedule_recipe, scheduled_recipe};
use serde::Deserialize;
use utoipa::ToSchema;

use crate::AppState;
use crate::error::ApiError;
use crate::extract::calendar::Calendar;
use crate::extract::user::User;
use crate::realtime::publish_calendar_event;
use crate::routes::calendar::serialization::{ScheduledRecipe, serialize_scheduled_recipe};

#[derive(Deserialize, ToSchema)]
#[serde(deny_unknown_fields)]
pub struct CalendarUpdateParams {
    on: NaiveDate,
}

#[utoipa::path(
    patch,
    path = "/api/v1/calendar/{scheduled_recipe_id}/",
    operation_id = "CalendarUpdate",
    params(("scheduled_recipe_id" = i32, Path)),
    request_body = CalendarUpdateParams,
    responses((status = 200, description = "Successful response.", body = ScheduledRecipe)),
)]
pub async fn calendar_update_view(
    State(state): State<AppState>,
    user: User,
    calendar: Calendar,
    Path(scheduled_recipe_id): Path<i32>,
    Json(CalendarUpdateParams { on }): Json<CalendarUpdateParams>,
) -> Result<Json<ScheduledRecipe>, ApiError> {
    let client = state.pool.get().await?;
    let id = reschedule_recipe()
        .bind(
            &client,
            &scheduled_recipe_id,
            &calendar.team_id,
            &calendar.id,
            &on,
            &user.id,
        )
        .opt()
        .await?
        // Django 500s with ScheduledRecipe.DoesNotExist.
        .ok_or(ApiError::NotFound)?;
    let row = scheduled_recipe()
        .bind(&client, &id, &calendar.team_id)
        .one()
        .await?;
    let res = serialize_scheduled_recipe(row, &state.config.storage_url, user.id, calendar.team_id);

    publish_calendar_event(&state, &res, calendar.team_id, calendar.id).await;
    Ok(Json(res))
}
