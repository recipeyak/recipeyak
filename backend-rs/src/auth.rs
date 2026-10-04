use axum::extract::FromRequestParts;
use axum::http::request::Parts;
use axum_extra::extract::CookieJar;

use crate::AppState;
use crate::django::session::{self, MODEL_BACKEND, SESSION_COOKIE_NAME};
use crate::error::ApiError;

/// An authenticated user, resolved from the Django session cookie.
///
/// Add it as a handler argument to require authentication.
#[derive(Debug, Clone)]
pub struct AuthUser {
    pub id: i32,
    pub schedule_team_id: Option<i32>,
}

impl FromRequestParts<AppState> for AuthUser {
    type Rejection = ApiError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        let jar = CookieJar::from_headers(&parts.headers);
        let session_key = jar
            .get(SESSION_COOKIE_NAME)
            .ok_or(ApiError::NotAuthenticated)?
            .value();

        let row = sqlx::query!(
            r#"
            SELECT session_data
            FROM user_sessions_session
            WHERE session_key = $1
              AND expire_date > now()
            "#,
            session_key
        )
        .fetch_optional(&state.pool)
        .await?
        .ok_or(ApiError::NotAuthenticated)?;

        let session =
            session::decode(&row.session_data, &state.config.secret_key).map_err(|err| {
                tracing::warn!(error = %err, "session data corrupted");
                ApiError::NotAuthenticated
            })?;
        if session.backend != MODEL_BACKEND {
            return Err(ApiError::NotAuthenticated);
        }
        let user_id: i32 = session
            .user_id
            .parse()
            .map_err(|_| ApiError::NotAuthenticated)?;

        let user = sqlx::query!(
            r#"
            SELECT id, password, schedule_team_id
            FROM core_myuser
            WHERE id = $1
            "#,
            user_id
        )
        .fetch_optional(&state.pool)
        .await?
        .ok_or(ApiError::NotAuthenticated)?;

        if !session::verify_session_auth_hash(
            &session.hash,
            &user.password,
            &state.config.secret_key,
        ) {
            return Err(ApiError::NotAuthenticated);
        }

        Ok(Self {
            id: user.id,
            schedule_team_id: user.schedule_team_id,
        })
    }
}
