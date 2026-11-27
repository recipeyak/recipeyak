//! Ports of `recipeyak.api.calendar_settings_retrieve_view`,
//! `calendar_update_settings_view`, and `calendar_generate_link_view`.
//!
//! GET /api/v1/calendar/settings/
//! PATCH /api/v1/calendar/settings/
//! POST /api/v1/calendar/generate_link/

use axum::http::HeaderMap;
use axum::http::header::HOST;
use cornucopia::queries::membership::{
    CalendarSettings, calendar_settings, update_calendar_secret_key, update_calendar_sync_enabled,
};
use rand::RngExt;
use rand::distr::Alphanumeric;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

use crate::db::Db;
use crate::error::{ApiError, OrNotFound};
use crate::extract::Json;
use crate::extract::team::Team;
use crate::extract::user::User;

#[derive(Serialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct CalendarSettingsResponse {
    sync_enabled: bool,
    calendar_link: String,
}

#[derive(Deserialize, ToSchema)]
#[serde(deny_unknown_fields, rename_all = "camelCase")]
pub struct CalendarUpdateSettingsParams {
    sync_enabled: bool,
}

impl CalendarSettingsResponse {
    /// `get_cal_settings`
    fn from_membership(
        headers: &HeaderMap,
        team_id: i32,
        membership: CalendarSettings,
    ) -> Result<Json<Self>, ApiError> {
        // request.get_host()
        let host = headers
            .get(HOST)
            .and_then(|h| h.to_str().ok())
            .ok_or_else(|| ApiError::validation("missing Host header"))?;
        Ok(Json(Self {
            sync_enabled: membership.calendar_sync_enabled,
            calendar_link: format!(
                "webcal://{host}/t/{team_id}/ical/{}/schedule.ics",
                membership.calendar_secret_key
            ),
        }))
    }
}

#[utoipa::path(
    get,
    path = "/api/v1/calendar/settings/",
    operation_id = "CalendarSettingsRetrieve",
    responses((status = 200, description = "Successful response.", body = CalendarSettingsResponse)),
)]
pub async fn settings_retrieve_view(
    headers: HeaderMap,
    user: User,
    team: Team,
    db: Db,
) -> Result<Json<CalendarSettingsResponse>, ApiError> {
    let membership = calendar_settings()
        .bind(&db, &team.id, &user.id)
        .opt()
        .await?
        .or_not_found()?;
    CalendarSettingsResponse::from_membership(&headers, team.id, membership)
}

#[utoipa::path(
    patch,
    path = "/api/v1/calendar/settings/",
    operation_id = "CalendarUpdateSettings",
    request_body = CalendarUpdateSettingsParams,
    responses((status = 200, description = "Successful response.", body = CalendarSettingsResponse)),
)]
pub async fn update_settings_view(
    headers: HeaderMap,
    user: User,
    team: Team,
    db: Db,
    Json(CalendarUpdateSettingsParams { sync_enabled }): Json<CalendarUpdateSettingsParams>,
) -> Result<Json<CalendarSettingsResponse>, ApiError> {
    let membership = update_calendar_sync_enabled()
        .bind(&db, &sync_enabled, &team.id, &user.id)
        .opt()
        .await?
        .or_not_found()?;
    CalendarSettingsResponse::from_membership(&headers, team.id, membership)
}

#[utoipa::path(
    post,
    path = "/api/v1/calendar/generate_link/",
    operation_id = "CalendarGenerateLink",
    responses((status = 200, description = "Successful response.", body = CalendarSettingsResponse)),
)]
pub async fn generate_link_view(
    headers: HeaderMap,
    user: User,
    team: Team,
    db: Db,
) -> Result<Json<CalendarSettingsResponse>, ApiError> {
    // get_random_ical_id
    let secret_key: String = rand::rng()
        .sample_iter(Alphanumeric)
        .take(48)
        .map(char::from)
        .collect();
    let membership = update_calendar_secret_key()
        .bind(&db, &secret_key, &team.id, &user.id)
        .opt()
        .await?
        .or_not_found()?;
    CalendarSettingsResponse::from_membership(&headers, team.id, membership)
}
