//! The user's selected team, mirroring `get_team`.

use axum::extract::FromRequestParts;
use axum::http::request::Parts;

use crate::AppState;
use crate::error::ApiError;
use crate::extract::user::User;

pub struct Team {
    pub id: i32,
}

impl FromRequestParts<AppState> for Team {
    type Rejection = ApiError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        let user = User::from_request_parts(parts, state).await?;

        let id = user
            .schedule_team_id
            .ok_or_else(|| ApiError::Internal("should always have a team selected".into()))?;
        let is_member: bool = sqlx::query_scalar(
            "SELECT EXISTS (SELECT 1 FROM core_team t JOIN core_membership m ON m.team_id = t.id WHERE t.id = $1 AND m.user_id = $2 AND m.is_active)",
        )
        .bind(id)
        .bind(user.id)
        .fetch_one(&state.pool)
        .await?;
        if !is_member {
            return Err(ApiError::NotFound);
        }

        Ok(Team { id })
    }
}
