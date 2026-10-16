//! Port of `recipeyak.api.calendar_list_view`.
//!
//! GET /api/v1/calendar/?start=YYYY-MM-DD&end=YYYY-MM-DD

use axum::Json;
use axum::extract::State;
use chrono::NaiveDate;
use cornucopia::queries::scheduled_recipe::scheduled_recipes;
use serde::{Deserialize, Serialize};
use utoipa::{IntoParams, ToSchema};

use crate::AppState;
use crate::error::ApiError;
use crate::extract::calendar::Calendar;
use crate::extract::params::Params;
use crate::extract::user::User;
use crate::routes::calendar::scheduled_recipe::ScheduledRecipe;

#[derive(Deserialize, IntoParams)]
#[serde(deny_unknown_fields)]
#[into_params(parameter_in = Query)]
pub struct CalendarListParams {
    start: NaiveDate,
    end: NaiveDate,
}

#[derive(Serialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct CalendarListResponse {
    scheduled_recipes: Vec<ScheduledRecipe>,
}

#[utoipa::path(
    get,
    path = "/api/v1/calendar/",
    operation_id = "CalendarList",
    params(CalendarListParams),
    responses((status = 200, description = "Successful response.", body = CalendarListResponse)),
)]
pub async fn list_view(
    State(state): State<AppState>,
    user: User,
    Params(CalendarListParams { start, end }): Params<CalendarListParams>,
    calendar: Calendar,
) -> Result<Json<CalendarListResponse>, ApiError> {
    Ok(Json(
        list_scheduled_recipes(&state, &user, &calendar, start, end).await?,
    ))
}

/// Shared with the bootstrap data in `index.html`.
pub async fn list_scheduled_recipes(
    state: &AppState,
    user: &User,
    calendar: &Calendar,
    start: NaiveDate,
    end: NaiveDate,
) -> Result<CalendarListResponse, ApiError> {
    let client = state.pool.get().await?;
    let rows = scheduled_recipes()
        .bind(&client, &calendar.team_id, &calendar.id, &start, &end)
        .all()
        .await?;

    let scheduled_recipes = rows
        .into_iter()
        .map(|row| {
            ScheduledRecipe::from_row(row, &state.config.storage_url, user.id, calendar.team_id)
        })
        .collect();

    Ok(CalendarListResponse { scheduled_recipes })
}
