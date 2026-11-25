//! The note in the `{note_id}` path segment, mirroring
//! `get_object_or_404(filter_notes(team=team), pk=...)`.

use axum::extract::{FromRequestParts, OptionalFromRequestParts, Path};
use axum::http::request::Parts;
use cornucopia::queries::note::team_note;
use serde::Deserialize;

use crate::AppState;
use crate::error::ApiError;
use crate::extract::team::Team;

pub struct TeamNote {
    pub id: i32,
    pub created_by_id: i32,
    pub recipe_id: i32,
}

#[derive(Deserialize)]
struct NotePath {
    note_id: i32,
}

/// Rejects with a 404 when the note isn't on the user's team.
impl FromRequestParts<AppState> for TeamNote {
    type Rejection = ApiError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        load(parts, state).await?.ok_or(ApiError::NotFound)
    }
}

/// `Option<TeamNote>` is `None` when the note isn't on the user's team, for
/// views where that's a no-op.
impl OptionalFromRequestParts<AppState> for TeamNote {
    type Rejection = ApiError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Option<Self>, Self::Rejection> {
        load(parts, state).await
    }
}

#[tracing::instrument(name = "TeamNote", skip_all, fields(sentry.op = "extract"))]
async fn load(parts: &mut Parts, state: &AppState) -> Result<Option<TeamNote>, ApiError> {
    let Path(NotePath { note_id }) =
        <Path<NotePath> as FromRequestParts<_>>::from_request_parts(parts, state)
            .await
            .map_err(|err| ApiError::Validation(err.body_text()))?;
    let team = Team::from_request_parts(parts, state).await?;

    let client = state.pool.get().await?;
    let note = team_note()
        .bind(&client, &note_id, &team.id)
        .opt()
        .await?
        .map(|row| TeamNote {
            id: note_id,
            created_by_id: row.created_by_id,
            recipe_id: row.recipe_id,
        });
    Ok(note)
}
