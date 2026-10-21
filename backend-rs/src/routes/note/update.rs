//! Port of `recipeyak.api.note_update_view`.
//!
//! PATCH /api/v1/notes/{note_id}/

use axum::Json;
use axum::extract::State;
use axum::http::StatusCode;
use cornucopia::queries::note::{attach_uploads, detach_uploads, insert_note_version, update_note};
use serde::Deserialize;
use utoipa::ToSchema;

use crate::AppState;
use crate::error::ApiError;
use crate::extract::note::TeamNote;
use crate::extract::team::Team;
use crate::extract::user::User;
use crate::realtime::publish_recipe;
use crate::routes::note::serialize::{Note, parse_upload_ids};

#[derive(Deserialize, ToSchema)]
#[serde(deny_unknown_fields)]
pub struct NoteUpdateParams {
    #[serde(default)]
    #[schema(required = false)]
    text: Option<String>,
    #[serde(default)]
    #[schema(required = false)]
    attachment_upload_ids: Option<Vec<String>>,
}

#[utoipa::path(
    patch,
    path = "/api/v1/notes/{note_id}/",
    operation_id = "NoteUpdate",
    params(("note_id" = i32, Path)),
    request_body = NoteUpdateParams,
    responses((status = 200, description = "Successful response.", body = Note)),
)]
pub async fn update_view(
    State(state): State<AppState>,
    user: User,
    team: Team,
    note: TeamNote,
    Json(params): Json<NoteUpdateParams>,
) -> Result<Json<Note>, ApiError> {
    // Like Django, empty values leave the note's text and attachments as is.
    let text = params.text.filter(|t| !t.is_empty());
    let upload_ids = params
        .attachment_upload_ids
        .filter(|ids| !ids.is_empty())
        .map(|ids| parse_upload_ids(&ids))
        .transpose()?;

    if note.created_by_id != user.id {
        return Err(ApiError::Api {
            code: "missing_perms",
            message: "Only the note's author is allowed to update the note.",
            status: StatusCode::FORBIDDEN,
        });
    }

    let note_id = note.id;
    let mut client = state.pool.get().await?;
    let tx = client.transaction().await?;
    insert_note_version().bind(&tx, &user.id, &note_id).await?;
    if let Some(upload_ids) = upload_ids {
        detach_uploads().bind(&tx, &note_id).await?;
        attach_uploads()
            .bind(&tx, &note_id, &upload_ids, &user.id)
            .await?;
    }
    update_note().bind(&tx, &text, &note_id).await?;
    tx.commit().await?;

    publish_recipe(&state, note.recipe_id, team.id).await;

    let note = Note::load(&client, &state.config.storage_url, note_id, team.id).await?;
    Ok(Json(note))
}
