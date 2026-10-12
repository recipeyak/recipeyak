//! The user's pinned calendar, mirroring `get_team` + `get_pinned_calendar`.

use axum::extract::FromRequestParts;
use axum::http::request::Parts;

use crate::AppState;
use crate::error::ApiError;
use crate::extract::team::Team;
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
        let team_id = Team::from_request_parts(parts, state).await?.id;

        // get_pinned_calendar
        let id = user.pinned_calendar_id.ok_or_else(|| {
            ApiError::Internal("should always have a pinned calendar selected".into())
        })?;
        let client = state.pool.get().await?;
        let stmt = client
            .prepare_cached(
                "SELECT EXISTS (SELECT 1 FROM core_calendar WHERE id = $1 AND team_id = $2)",
            )
            .await?;
        let exists: bool = client
            .query_one(&stmt, &[&id, &team_id])
            .await?
            .try_get(0)?;
        if !exists {
            return Err(ApiError::Internal(
                "Calendar matching query does not exist.".into(),
            ));
        }

        Ok(Calendar { id, team_id })
    }
}
