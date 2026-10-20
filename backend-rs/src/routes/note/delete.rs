//! Port of `recipeyak.api.note_delete_view`.
//!
//! DELETE /api/v1/notes/{note_id}/

use axum::extract::{Path, State};
use axum::http::StatusCode;
use cornucopia::queries::note::{
    delete_note, delete_note_reactions, delete_note_versions, detach_uploads, team_note,
};

use crate::AppState;
use crate::error::ApiError;
use crate::extract::team::Team;
use crate::extract::user::User;
use crate::realtime::publish_recipe;

#[utoipa::path(
    delete,
    path = "/api/v1/notes/{note_id}/",
    operation_id = "NoteDelete",
    params(("note_id" = i32, Path)),
    responses((status = 204, description = "No content")),
)]
pub async fn delete_view(
    State(state): State<AppState>,
    user: User,
    team: Team,
    Path(note_id): Path<i32>,
) -> Result<StatusCode, ApiError> {
    let mut client = state.pool.get().await?;
    let note = team_note().bind(&client, &note_id, &team.id).opt().await?;
    // Deleting a missing note, or someone else's, is a no-op like Django.
    let Some(note) = note.filter(|n| n.created_by_id == user.id) else {
        return Ok(StatusCode::NO_CONTENT);
    };

    let tx = client.transaction().await?;
    delete_note_reactions().bind(&tx, &note_id).await?;
    delete_note_versions().bind(&tx, &note_id).await?;
    detach_uploads().bind(&tx, &note_id).await?;
    delete_note().bind(&tx, &note_id).await?;
    tx.commit().await?;

    publish_recipe(&state, note.recipe_id, team.id).await;
    Ok(StatusCode::NO_CONTENT)
}
