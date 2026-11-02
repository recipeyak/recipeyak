//! Port of `recipeyak.api.note_create_view`.
//!
//! POST /api/v1/recipes/{recipe_id}/notes/

use axum::Json;
use axum::extract::State;
use cornucopia::queries::note::{attach_uploads, insert_note};
use serde::Deserialize;
use utoipa::ToSchema;

use crate::AppState;
use crate::error::ApiError;
use crate::extract::recipe::TeamRecipe;
use crate::extract::user::User;
use crate::realtime::publish_recipe;
use crate::routes::note::serialize::{Note, parse_upload_ids};

#[derive(Deserialize, ToSchema)]
#[serde(deny_unknown_fields)]
pub struct NoteCreateParams {
    text: String,
    attachment_upload_ids: Vec<String>,
}

#[utoipa::path(
    post,
    path = "/api/v1/recipes/{recipe_id}/notes/",
    operation_id = "NoteCreate",
    params(("recipe_id" = i32, Path)),
    request_body = NoteCreateParams,
    responses((status = 200, description = "Successful response.", body = Note)),
)]
pub async fn create_view(
    State(state): State<AppState>,
    user: User,
    recipe: TeamRecipe,
    Json(params): Json<NoteCreateParams>,
) -> Result<Json<Note>, ApiError> {
    let upload_ids = parse_upload_ids(&params.attachment_upload_ids)?;

    let mut client = state.pool.get().await?;
    let tx = client.transaction().await?;
    let note_id = insert_note()
        .bind(&tx, &params.text, &user.id, &recipe.id)
        .one()
        .await?;
    attach_uploads()
        .bind(&tx, &note_id, &upload_ids, &user.id)
        .await?;
    tx.commit().await?;

    publish_recipe(&state, recipe.id, recipe.team_id).await;

    let note = Note::load(&client, &state.config.storage_url, note_id, recipe.team_id).await?;
    Ok(Json(note))
}
