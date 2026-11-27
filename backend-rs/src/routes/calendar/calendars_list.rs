//! Port of `recipeyak.api.calendars_list_view`.
//!
//! GET /api/v1/calendars/

use cornucopia::queries::calendar::team_calendars;
use serde::Serialize;
use utoipa::ToSchema;

use crate::db::Db;
use crate::error::ApiError;
use crate::extract::Json;
use crate::extract::team::Team;
use crate::extract::user::User;

#[derive(Serialize, ToSchema)]
pub struct CalendarsListResponse {
    calendars: Vec<CalendarsListCalendar>,
}

#[derive(Serialize, ToSchema)]
struct CalendarsListCalendar {
    id: i32,
    name: String,
    pinned: bool,
}

#[utoipa::path(
    get,
    path = "/api/v1/calendars/",
    operation_id = "CalendarsList",
    responses((status = 200, description = "Successful response.", body = CalendarsListResponse)),
)]
pub async fn calendars_list_view(
    user: User,
    team: Team,
    db: Db,
) -> Result<Json<CalendarsListResponse>, ApiError> {
    let calendars = team_calendars()
        .bind(&db, &team.id)
        .all()
        .await?
        .into_iter()
        .map(|row| CalendarsListCalendar {
            pinned: user.pinned_calendar_id == Some(row.id),
            id: row.id,
            name: row.name,
        })
        .collect();

    Ok(Json(CalendarsListResponse { calendars }))
}
