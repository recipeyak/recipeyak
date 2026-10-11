//! The user's pinned calendar, mirroring `get_team` + `get_pinned_calendar`.

use axum::extract::FromRequestParts;
use axum::http::request::Parts;

use crate::AppState;
use crate::error::ApiError;
use crate::extract::user::User;

pub struct Calendar {
    pub id: i32,
    pub team_id: i32,
}

impl FromRequestParts<AppState> for Calendar {
    type Rejection = ApiError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        let user = User::from_request_parts(parts, state).await?;

        // get_team
        let team_id = user
            .schedule_team_id
            .ok_or_else(|| ApiError::Internal("should always have a team selected".into()))?;
        let is_member: bool = sqlx::query_scalar(
            "SELECT EXISTS (SELECT 1 FROM core_team t JOIN core_membership m ON m.team_id = t.id WHERE t.id = $1 AND m.user_id = $2 AND m.is_active)",
        )
        .bind(team_id)
        .bind(user.id)
        .fetch_one(&state.pool)
        .await?;
        if !is_member {
            return Err(ApiError::NotFound);
        }

        // get_pinned_calendar
        let id = user.pinned_calendar_id.ok_or_else(|| {
            ApiError::Internal("should always have a pinned calendar selected".into())
        })?;
        let exists: bool = sqlx::query_scalar(
            "SELECT EXISTS (SELECT 1 FROM core_calendar WHERE id = $1 AND team_id = $2)",
        )
        .bind(id)
        .bind(team_id)
        .fetch_one(&state.pool)
        .await?;
        if !exists {
            return Err(ApiError::Internal(
                "Calendar matching query does not exist.".into(),
            ));
        }

        Ok(Calendar { id, team_id })
    }
}
