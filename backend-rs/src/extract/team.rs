//! The user's selected team, mirroring `get_team`.

use axum::extract::FromRequestParts;
use axum::http::request::Parts;
use cornucopia::client::Params as _;
use cornucopia::queries::team::{IsActiveMemberParams, is_active_member};

use crate::AppState;
use crate::error::ApiError;
use crate::extract::user::User;

#[derive(Clone)]
pub struct Team {
    pub id: i32,
}

/// Cached on the request like `User`, so `Calendar` can reuse it.
impl FromRequestParts<AppState> for Team {
    type Rejection = ApiError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        if let Some(team) = parts.extensions.get::<Team>() {
            return Ok(team.clone());
        }
        let team = selected_team(parts, state).await?;
        parts.extensions.insert(team.clone());
        Ok(team)
    }
}

/// Instrumented here rather than on the extractor so cache hits don't add spans.
#[tracing::instrument(name = "Team", skip_all, fields(sentry.op = "extract"))]
async fn selected_team(parts: &mut Parts, state: &AppState) -> Result<Team, ApiError> {
    let user = User::from_request_parts(parts, state).await?;

    let id = user
        .schedule_team_id
        .ok_or_else(|| ApiError::internal("should always have a team selected"))?;
    let client = state.pool.get().await?;
    let is_member = is_active_member()
        .params(
            &client,
            &IsActiveMemberParams {
                team_id: id,
                user_id: user.id,
            },
        )
        .one()
        .await?;
    if !is_member {
        return Err(ApiError::NotFound);
    }

    Ok(Team { id })
}
