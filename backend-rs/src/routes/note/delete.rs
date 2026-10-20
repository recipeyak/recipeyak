//! Port of `recipeyak.api.note_delete_view`.
//!
//! DELETE /api/v1/notes/{note_id}/

use axum::extract::{Path, State};
use axum::http::StatusCode;
use cornucopia::queries::note::delete_note;

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
    let client = state.pool.get().await?;
    // Deleting a missing note, or someone else's, is a no-op like Django.
    if let Some(recipe_id) = delete_note()
        .bind(&client, &note_id, &user.id, &team.id)
        .opt()
        .await?
    {
        publish_recipe(&state, recipe_id, team.id).await;
    }
    Ok(StatusCode::NO_CONTENT)
}
