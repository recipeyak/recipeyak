//! Port of `recipeyak.api.calendar_create_view`.
//!
//! POST /api/v1/calendars/

use cornucopia::queries::calendar::insert_calendar;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

use crate::db::Db;
use crate::error::ApiError;
use crate::extract::Json;
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
    team: Team,
    db: Db,
    Json(CalendarCreateParams { name }): Json<CalendarCreateParams>,
) -> Result<Json<CalendarCreateResponse>, ApiError> {
    let id = insert_calendar().bind(&db, &name, &team.id).one().await?;

    Ok(Json(CalendarCreateResponse { id, name }))
}
