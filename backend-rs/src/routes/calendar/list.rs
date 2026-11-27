//! Port of `recipeyak.api.calendar_list_view`.
//!
//! GET /api/v1/calendar/?start=YYYY-MM-DD&end=YYYY-MM-DD

use axum::extract::State;
use chrono::NaiveDate;
use cornucopia::client::Params as _;
use cornucopia::queries::scheduled_recipe::{ScheduledRecipesParams, scheduled_recipes};
use serde::{Deserialize, Serialize};
use utoipa::{IntoParams, ToSchema};

use crate::AppState;
use crate::db::Db;
use crate::error::ApiError;
use crate::extract::calendar::Calendar;
use crate::extract::user::User;
use crate::extract::{Json, Params};
use crate::serializers::ScheduledRecipe;

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
    db: Db,
) -> Result<Json<CalendarListResponse>, ApiError> {
    let rows = scheduled_recipes()
        .params(
            &db,
            &ScheduledRecipesParams {
                team_id: calendar.team_id,
                calendar_id: calendar.id,
                start,
                end,
            },
        )
        .all()
        .await?;

    let scheduled_recipes = rows
        .into_iter()
        .map(|row| {
            ScheduledRecipe::from_row(row, &state.config.storage_url, user.id, calendar.team_id)
        })
        .collect();

    Ok(Json(CalendarListResponse { scheduled_recipes }))
}
