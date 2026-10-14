//! Ports of `recipeyak.api.calendar_settings_retrieve_view`,
//! `calendar_update_settings_view`, and `calendar_generate_link_view`.
//!
//! GET /api/v1/calendar/settings/
//! PATCH /api/v1/calendar/settings/
//! POST /api/v1/calendar/generate_link/

use axum::Json;
use axum::extract::State;
use axum::http::HeaderMap;
use axum::http::header::HOST;
use cornucopia::queries::membership::{
    CalendarSettings, calendar_settings, update_calendar_secret_key, update_calendar_sync_enabled,
};
use rand::RngExt;
use rand::distr::Alphanumeric;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

use crate::AppState;
use crate::error::ApiError;
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
            .ok_or_else(|| ApiError::Validation("missing Host header".into()))?;
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
    State(state): State<AppState>,
    headers: HeaderMap,
    user: User,
    team: Team,
) -> Result<Json<CalendarSettingsResponse>, ApiError> {
    let client = state.pool.get().await?;
    let membership = calendar_settings()
        .bind(&client, &team.id, &user.id)
        .opt()
        .await?
        .ok_or(ApiError::NotFound)?;
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
    State(state): State<AppState>,
    headers: HeaderMap,
    user: User,
    team: Team,
    Json(CalendarUpdateSettingsParams { sync_enabled }): Json<CalendarUpdateSettingsParams>,
) -> Result<Json<CalendarSettingsResponse>, ApiError> {
    let client = state.pool.get().await?;
    let membership = update_calendar_sync_enabled()
        .bind(&client, &sync_enabled, &team.id, &user.id)
        .opt()
        .await?
        .ok_or(ApiError::NotFound)?;
    CalendarSettingsResponse::from_membership(&headers, team.id, membership)
}

#[utoipa::path(
    post,
    path = "/api/v1/calendar/generate_link/",
    operation_id = "CalendarGenerateLink",
    responses((status = 200, description = "Successful response.", body = CalendarSettingsResponse)),
)]
pub async fn generate_link_view(
    State(state): State<AppState>,
    headers: HeaderMap,
    user: User,
    team: Team,
) -> Result<Json<CalendarSettingsResponse>, ApiError> {
    // get_random_ical_id
    let secret_key: String = rand::rng()
        .sample_iter(Alphanumeric)
        .take(48)
        .map(char::from)
        .collect();
    let client = state.pool.get().await?;
    let membership = update_calendar_secret_key()
        .bind(&client, &secret_key, &team.id, &user.id)
        .opt()
        .await?
        .ok_or(ApiError::NotFound)?;
    CalendarSettingsResponse::from_membership(&headers, team.id, membership)
}
