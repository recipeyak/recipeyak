//! The user's pinned calendar, mirroring `get_team` + `get_pinned_calendar`.

use axum::extract::FromRequestParts;
use axum::http::request::Parts;
use cornucopia::queries::calendar::calendar_exists;

use crate::AppState;
use crate::db::Db;
use crate::error::ApiError;
use crate::extract::team::Team;
use crate::extract::user::User;

pub struct Calendar {
    pub id: i32,
    pub team_id: i32,
}

impl FromRequestParts<AppState> for Calendar {
    type Rejection = ApiError;

    #[tracing::instrument(name = "Calendar", skip_all, fields(sentry.op = "extract"))]
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
        let client = Db::get(&state.pool).await?;
        let exists = calendar_exists().bind(&client, &id, &team_id).one().await?;
        if !exists {
            return Err(ApiError::Internal(
                "Calendar matching query does not exist.".into(),
            ));
        }

        Ok(Calendar { id, team_id })
    }
}
