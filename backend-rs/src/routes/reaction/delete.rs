//! Port of `recipeyak.api.reaction_delete_view`.
//!
//! DELETE /api/v1/reactions/{reaction_id}/

use axum::extract::{Path, State};
use axum::http::StatusCode;
use cornucopia::queries::note::delete_reaction;

use crate::AppState;
use crate::error::ApiError;
use crate::extract::user::User;
use crate::realtime::publish_recipe;

#[utoipa::path(
    delete,
    path = "/api/v1/reactions/{reaction_id}/",
    operation_id = "ReactionDelete",
    params(("reaction_id" = i32, Path)),
    responses((status = 204, description = "No content")),
)]
pub async fn delete_view(
    State(state): State<AppState>,
    user: User,
    Path(reaction_id): Path<i32>,
) -> Result<StatusCode, ApiError> {
    let client = state.pool.get().await?;
    // Unlike the other note views, Django only checks the reaction is the
    // user's, not that it's on their team's recipe.
    let deleted = delete_reaction()
        .bind(&client, &reaction_id, &user.id)
        .opt()
        .await?;
    if let Some(row) = deleted
        && let Some(team_id) = row.team_id
    {
        publish_recipe(&state, row.recipe_id, team_id).await;
    }
    Ok(StatusCode::NO_CONTENT)
}
