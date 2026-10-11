//! Port of `recipeyak.api.calendar_create_view`.
//!
//! POST /api/v1/calendars/

use axum::Json;
use axum::extract::State;
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
pub async fn calendar_create_view(
    State(state): State<AppState>,
    team: Team,
    Json(CalendarCreateParams { name }): Json<CalendarCreateParams>,
) -> Result<Json<CalendarCreateResponse>, ApiError> {
    // CommonInfo's `created` default and `modified` auto_now are set by
    // Django, not the database.
    let id: i32 = sqlx::query_scalar(
        "INSERT INTO core_calendar (name, team_id, created, modified) VALUES ($1, $2, now(), now()) RETURNING id",
    )
    .bind(&name)
    .bind(team.id)
    .fetch_one(&state.pool)
    .await?;

    Ok(Json(CalendarCreateResponse { id, name }))
}
