//! Serve the UI's `index.html` with the data the first page needs, so the UI
//! can render without waiting on its first API requests.
//!
//! nginx routes UI pages here and falls back to the static file when this
//! server is down, so the data is optional: the UI fetches whatever is
//! missing.

use axum::extract::{FromRequestParts, State};
use axum::http::StatusCode;
use axum::http::request::Parts;
use axum::response::{Html, IntoResponse, Response};
use axum_extra::extract::CookieJar;
use chrono::{Days, NaiveDate, Utc};
use cornucopia::queries::user::user_detail;
use serde::Serialize;

use crate::AppState;
use crate::error::ApiError;
use crate::extract::calendar::Calendar;
use crate::extract::user::{SESSION_COOKIE_NAME, authenticate};
use crate::routes::calendar::{CalendarListResponse, list_scheduled_recipes};
use crate::urls::avatar_url;

/// Replaced with the bootstrap script, see `frontend/index.html`.
const MARKER: &str = "<!--bootstrap-->";

/// The UI asks for the three weeks around the week it's showing. The server
/// doesn't know the browser's timezone, so fetch a bit more and let the UI
/// check that the range covers its own.
const CALENDAR_DAYS: Days = Days::new(35);

#[derive(Serialize)]
struct Bootstrap {
    user: UserResponse,
    calendar: Option<BootstrapCalendar>,
}

/// Port of `recipeyak.api.user_retrieve_view.UserSerializer`.
#[derive(Serialize)]
struct UserResponse {
    id: i32,
    name: String,
    avatar_url: String,
    email: String,
    theme_day: String,
    theme_night: String,
    theme_mode: String,
    schedule_team: Option<i32>,
    calendar_id: Option<i32>,
}

#[derive(Serialize)]
struct BootstrapCalendar {
    team: i32,
    start: NaiveDate,
    end: NaiveDate,
    #[serde(flatten)]
    response: CalendarListResponse,
}

pub async fn index_view(State(state): State<AppState>, mut parts: Parts) -> Response {
    // Read on every request since the deploy replaces the file after this
    // server restarts. It's small and stays in the page cache.
    let html = match tokio::fs::read_to_string(&state.config.index_html).await {
        Ok(html) => html,
        Err(err) => {
            tracing::error!(error = %err, path = ?state.config.index_html, "could not read index.html");
            return StatusCode::INTERNAL_SERVER_ERROR.into_response();
        }
    };
    let bootstrap = match load(&state, &mut parts).await {
        Ok(bootstrap) => bootstrap,
        Err(err) => {
            tracing::error!(error = ?err, "could not load bootstrap data");
            None
        }
    };
    Html(render(&html, bootstrap.as_ref())).into_response()
}

#[tracing::instrument(name = "bootstrap", skip_all)]
async fn load(state: &AppState, parts: &mut Parts) -> Result<Option<Bootstrap>, ApiError> {
    let jar = CookieJar::from_headers(&parts.headers);
    let session_key = jar.get(SESSION_COOKIE_NAME).map(|c| c.value());
    let Some(user) = authenticate(&state.pool, session_key).await? else {
        return Ok(None);
    };
    // Lets the Calendar extractor below reuse the user.
    parts.extensions.insert(user.clone());

    let client = state.pool.get().await?;
    let row = user_detail().bind(&client, &user.id).one().await?;
    drop(client);
    let user_response = UserResponse {
        id: row.id,
        avatar_url: avatar_url(
            &state.config.storage_url,
            &row.email,
            row.profile_upload_key.as_deref(),
        ),
        // `user.name or user.email`
        name: row
            .name
            .filter(|n| !n.is_empty())
            .unwrap_or(row.email.clone()),
        email: row.email,
        theme_day: row.theme_day,
        theme_night: row.theme_night,
        theme_mode: row.theme_mode,
        schedule_team: row.schedule_team_id,
        calendar_id: row.pinned_calendar_id,
    };

    // Users without a team or pinned calendar get an error from the calendar
    // endpoint too, so leave it to the UI to report.
    let calendar = match Calendar::from_request_parts(parts, state).await {
        Ok(calendar) => {
            let today = Utc::now().date_naive();
            let start = today - CALENDAR_DAYS;
            let end = today + CALENDAR_DAYS;
            let response = list_scheduled_recipes(state, &user, &calendar, start, end).await?;
            Some(BootstrapCalendar {
                team: calendar.team_id,
                start,
                end,
                response,
            })
        }
        Err(_) => None,
    };

    Ok(Some(Bootstrap {
        user: user_response,
        calendar,
    }))
}

fn render(html: &str, bootstrap: Option<&Bootstrap>) -> String {
    let script = match bootstrap {
        Some(bootstrap) => {
            // JSON only has `<` inside strings, where `<` decodes to the
            // same character. Without any `<`, user data can't close the
            // script tag or start an HTML comment in it.
            let json = serde_json::to_string(bootstrap)
                .expect("bootstrap data has only string keys")
                .replace('<', "\\u003c");
            format!(r#"<script type="application/json" id="bootstrap">{json}</script>"#)
        }
        None => String::new(),
    };
    html.replacen(MARKER, &script, 1)
}
