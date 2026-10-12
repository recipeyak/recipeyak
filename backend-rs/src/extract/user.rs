//! Authenticate requests using the Django session cookie.
//!
//! `user_sessions` stores the logged in user's id on the session row, so we
//! read it from there instead of decoding Django's signed `session_data`.
//! Django checks the session's auth hash to drop sessions after a password
//! change; we skip that because the password views delete those sessions.

use axum::extract::FromRequestParts;
use axum::http::request::Parts;
use axum_extra::extract::CookieJar;
use deadpool_postgres::Pool;
use postgres_from_row::FromRow;

use crate::AppState;
use crate::error::ApiError;

pub const SESSION_COOKIE_NAME: &str = "sessionid";

#[derive(Debug, Clone, FromRow)]
pub struct User {
    pub id: i32,
    pub schedule_team_id: Option<i32>,
    pub pinned_calendar_id: Option<i32>,
}

/// Extracting a `User` rejects anonymous requests with `not_authenticated`.
/// The result is cached on the request so other extractors can reuse it.
impl FromRequestParts<AppState> for User {
    type Rejection = ApiError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        if let Some(user) = parts.extensions.get::<User>() {
            return Ok(user.clone());
        }
        let jar = CookieJar::from_headers(&parts.headers);
        let session_key = jar.get(SESSION_COOKIE_NAME).map(|c| c.value());
        let user = authenticate(&state.pool, session_key)
            .await?
            .ok_or_else(ApiError::not_authenticated)?;
        parts.extensions.insert(user.clone());
        Ok(user)
    }
}

pub async fn authenticate(
    pool: &Pool,
    session_key: Option<&str>,
) -> Result<Option<User>, ApiError> {
    let Some(session_key) = session_key else {
        return Ok(None);
    };
    let client = pool.get().await?;
    let stmt = client
        .prepare_cached(
            "SELECT u.id, u.schedule_team_id, u.pinned_calendar_id
             FROM user_sessions_session s
             JOIN core_myuser u ON u.id = s.user_id
             WHERE s.session_key = $1 AND s.expire_date > now()",
        )
        .await?;
    let Some(row) = client.query_opt(&stmt, &[&session_key]).await? else {
        return Ok(None);
    };
    Ok(Some(User::try_from_row(&row)?))
}
