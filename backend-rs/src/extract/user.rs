//! Authenticate requests using the Django session cookie.
//!
//! Mirrors `user_sessions.backends.db.SessionStore` + `django.contrib.auth.get_user`:
//! load the unexpired session row, verify and decode its signed payload, then
//! check the stored auth hash against the user's current password hash so
//! sessions are invalidated on password change.

use axum::extract::FromRequestParts;
use axum::http::request::Parts;
use axum_extra::extract::CookieJar;
use sqlx::PgPool;

use crate::AppState;
use crate::error::ApiError;

#[derive(Debug, Clone, sqlx::FromRow)]
pub struct User {
    pub id: i32,
    pub password: String,
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
        let session_key = jar
            .get(django_session::SESSION_COOKIE_NAME)
            .map(|c| c.value());
        let user = authenticate(&state.pool, &state.config.secret_key, session_key)
            .await?
            .ok_or_else(ApiError::not_authenticated)?;
        parts.extensions.insert(user.clone());
        Ok(user)
    }
}

pub async fn authenticate(
    pool: &PgPool,
    secret_key: &str,
    session_key: Option<&str>,
) -> Result<Option<User>, ApiError> {
    let Some(session_key) = session_key.filter(|k| django_session::is_valid_session_key(k)) else {
        return Ok(None);
    };
    let row: Option<(String,)> = sqlx::query_as(
        "SELECT session_data FROM user_sessions_session WHERE session_key = $1 AND expire_date > now()",
    )
    .bind(session_key)
    .fetch_optional(pool)
    .await?;
    let Some((session_data,)) = row else {
        return Ok(None);
    };
    let Some(auth) = django_session::auth_session(secret_key, &session_data) else {
        return Ok(None);
    };
    if auth.backend != django_session::MODEL_BACKEND {
        return Ok(None);
    }
    let Ok(user_id) = auth.user_id.parse::<i32>() else {
        return Ok(None);
    };
    let user: Option<User> = sqlx::query_as(
        "SELECT id, password, schedule_team_id, pinned_calendar_id FROM core_myuser WHERE id = $1",
    )
    .bind(user_id)
    .fetch_optional(pool)
    .await?;
    let Some(user) = user else {
        return Ok(None);
    };
    if !django_session::verify_session_auth_hash(secret_key, &user.password, &auth.hash) {
        return Ok(None);
    }
    Ok(Some(user))
}
