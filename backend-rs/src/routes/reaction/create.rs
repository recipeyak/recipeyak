//! Port of `recipeyak.api.reaction_create_view`.
//!
//! POST /api/v1/notes/{note_id}/reactions/

use axum::Json;
use axum::extract::{Path, State};
use cornucopia::queries::note::{insert_reaction, reaction, team_note};
use serde::Deserialize;
use utoipa::ToSchema;

use crate::AppState;
use crate::error::ApiError;
use crate::extract::team::Team;
use crate::extract::user::User;
use crate::realtime::publish_recipe;
use crate::routes::note::serialize::{Emoji, Reaction};

#[derive(Deserialize, ToSchema)]
#[serde(deny_unknown_fields)]
pub struct ReactionCreateParams {
    #[serde(rename = "type")]
    kind: Emoji,
}

#[utoipa::path(
    post,
    path = "/api/v1/notes/{note_id}/reactions/",
    operation_id = "ReactionCreate",
    params(("note_id" = i32, Path)),
    request_body = ReactionCreateParams,
    responses((status = 200, description = "Successful response.", body = Reaction)),
)]
pub async fn create_view(
    State(state): State<AppState>,
    user: User,
    team: Team,
    Path(note_id): Path<i32>,
    Json(params): Json<ReactionCreateParams>,
) -> Result<Json<Reaction>, ApiError> {
    let client = state.pool.get().await?;
    let note = team_note()
        .bind(&client, &note_id, &team.id)
        .opt()
        .await?
        .ok_or(ApiError::NotFound)?;
    let reaction_id = insert_reaction()
        .bind(&client, &params.kind.as_str(), &user.id, &note_id)
        .one()
        .await?;
    let row = reaction().bind(&client, &reaction_id).one().await?;

    publish_recipe(&state, note.recipe_id, team.id).await;
    Ok(Json(Reaction::from_row(row, &state.config.storage_url)))
}
