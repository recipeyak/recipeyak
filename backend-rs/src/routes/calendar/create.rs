//! Port of `recipeyak.api.calendar_create_view`.
//!
//! POST /api/v1/calendars/

use axum::Json;
use axum::extract::State;
use cornucopia::queries::calendar::insert_calendar;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

use crate::AppState;
use crate::error::ApiError;
use crate::extract::team::Team;

#[derive(Deserialize, ToSchema)]
#[serde(deny_unknown_fields)]
pub struct CalendarCreateParams {
    name: String,
}

#[derive(Serialize, ToSchema)]
pub struct CalendarCreateResponse {
    id: i32,
    name: String,
}

#[utoipa::path(
    post,
    path = "/api/v1/calendars/",
    operation_id = "CalendarCreate",
    request_body = CalendarCreateParams,
    responses((status = 200, description = "Successful response.", body = CalendarCreateResponse)),
)]
pub async fn create_view(
    State(state): State<AppState>,
    team: Team,
    Json(CalendarCreateParams { name }): Json<CalendarCreateParams>,
) -> Result<Json<CalendarCreateResponse>, ApiError> {
    let client = state.pool.get().await?;
    let id = insert_calendar()
        .bind(&client, &name, &team.id)
        .one()
        .await?;

    Ok(Json(CalendarCreateResponse { id, name }))
}
