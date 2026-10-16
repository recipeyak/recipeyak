//! The user's selected team, mirroring `get_team`.

use axum::extract::FromRequestParts;
use axum::http::request::Parts;
use cornucopia::queries::team::is_active_member;

use crate::AppState;
use crate::db::Db;
use crate::error::ApiError;
use crate::extract::user::User;

pub struct Team {
    pub id: i32,
}

impl FromRequestParts<AppState> for Team {
    type Rejection = ApiError;

    #[tracing::instrument(name = "Team", skip_all, fields(sentry.op = "extract"))]
    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        let user = User::from_request_parts(parts, state).await?;

        let id = user
            .schedule_team_id
            .ok_or_else(|| ApiError::Internal("should always have a team selected".into()))?;
        let client = Db::get(&state.pool).await?;
        let is_member = is_active_member()
            .bind(&client, &id, &user.id)
            .one()
            .await?;
        if !is_member {
            return Err(ApiError::NotFound);
        }

        Ok(Team { id })
    }
}
