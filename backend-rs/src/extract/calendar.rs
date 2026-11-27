//! The user's pinned calendar, mirroring `get_team` + `get_pinned_calendar`.

use axum::extract::FromRequestParts;
use axum::http::request::Parts;
use cornucopia::queries::calendar::calendar_exists;

use crate::AppState;
use crate::error::ApiError;
use crate::extract::team::Team;
use crate::extract::user::User;

#[derive(Clone)]
pub struct Calendar {
    pub id: i32,
    pub team_id: i32,
}

/// Cached on the request like `User`.
impl FromRequestParts<AppState> for Calendar {
    type Rejection = ApiError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        if let Some(calendar) = parts.extensions.get::<Calendar>() {
            return Ok(calendar.clone());
        }
        let calendar = pinned_calendar(parts, state).await?;
        parts.extensions.insert(calendar.clone());
        Ok(calendar)
    }
}

/// Instrumented here rather than on the extractor so cache hits don't add spans.
#[tracing::instrument(name = "Calendar", skip_all, fields(sentry.op = "extract"))]
async fn pinned_calendar(parts: &mut Parts, state: &AppState) -> Result<Calendar, ApiError> {
    let user = User::from_request_parts(parts, state).await?;
    let team_id = Team::from_request_parts(parts, state).await?.id;

    // get_pinned_calendar
    let id = user
        .pinned_calendar_id
        .ok_or_else(|| ApiError::internal("should always have a pinned calendar selected"))?;
    let client = state.pool.get().await?;
    let exists = calendar_exists().bind(&client, &id, &team_id).one().await?;
    if !exists {
        return Err(ApiError::internal(
            "Calendar matching query does not exist.",
        ));
    }

    Ok(Calendar { id, team_id })
}
