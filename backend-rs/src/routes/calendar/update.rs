//! Port of `recipeyak.api.calendar_update_view`.
//!
//! PATCH /api/v1/calendar/{scheduled_recipe_id}/

use axum::extract::State;
use chrono::NaiveDate;
use cornucopia::client::Params as _;
use cornucopia::queries::scheduled_recipe::{
    RescheduleRecipeParams, ScheduledRecipeParams, reschedule_recipe, scheduled_recipe,
};
use serde::Deserialize;
use utoipa::ToSchema;

use crate::AppState;
use crate::db::Db;
use crate::error::{ApiError, OrNotFound};
use crate::extract::calendar::Calendar;
use crate::extract::user::User;
use crate::extract::{Json, Path};
use crate::realtime::publish_calendar_event;
use crate::serializers::ScheduledRecipe;

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
pub async fn update_view(
    State(state): State<AppState>,
    user: User,
    calendar: Calendar,
    db: Db,
    Path(scheduled_recipe_id): Path<i32>,
    Json(CalendarUpdateParams { on }): Json<CalendarUpdateParams>,
) -> Result<Json<ScheduledRecipe>, ApiError> {
    let id = reschedule_recipe()
        .params(
            &db,
            &RescheduleRecipeParams {
                id: scheduled_recipe_id,
                team_id: calendar.team_id,
                calendar_id: calendar.id,
                on,
                actor_id: user.id,
            },
        )
        .opt()
        .await?
        // Django 500s with ScheduledRecipe.DoesNotExist.
        .or_not_found()?;
    let row = scheduled_recipe()
        .params(
            &db,
            &ScheduledRecipeParams {
                id,
                team_id: calendar.team_id,
            },
        )
        .one()
        .await?;
    let res = ScheduledRecipe::from_row(row, &state.config.storage_url, user.id, calendar.team_id);

    publish_calendar_event(&state, &res, calendar.team_id, calendar.id).await;
    Ok(Json(res))
}
