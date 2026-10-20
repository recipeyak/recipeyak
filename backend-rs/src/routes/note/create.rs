//! Port of `recipeyak.api.note_create_view`.
//!
//! POST /api/v1/recipes/{recipe_id}/notes/

use axum::Json;
use axum::extract::{Path, State};
use cornucopia::queries::note::insert_note;
use serde::Deserialize;
use utoipa::ToSchema;

use crate::AppState;
use crate::error::ApiError;
use crate::extract::team::Team;
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
    team: Team,
    Path(recipe_id): Path<i32>,
    Json(params): Json<NoteCreateParams>,
) -> Result<Json<Note>, ApiError> {
    let upload_ids = parse_upload_ids(&params.attachment_upload_ids)?;

    let client = state.pool.get().await?;
    let note_id = insert_note()
        .bind(
            &client,
            &params.text,
            &user.id,
            &recipe_id,
            &team.id,
            &upload_ids,
        )
        .opt()
        .await?
        .ok_or(ApiError::NotFound)?;

    publish_recipe(&state, recipe_id, team.id).await;

    let note = Note::load(&client, &state.config.storage_url, note_id).await?;
    Ok(Json(note))
}
