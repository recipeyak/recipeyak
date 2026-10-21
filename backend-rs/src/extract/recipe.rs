//! The recipe in the `{recipe_id}` path segment, mirroring
//! `get_object_or_404(filter_recipes(team=team), pk=...)`.

use axum::extract::{FromRequestParts, Path};
use axum::http::request::Parts;
use cornucopia::queries::recipe::recipe_exists;
use serde::Deserialize;

use crate::AppState;
use crate::error::ApiError;
use crate::extract::team::Team;

pub struct TeamRecipe {
    pub id: i32,
    pub team_id: i32,
}

#[derive(Deserialize)]
struct RecipePath {
    recipe_id: i32,
}

/// Rejects with a 404 when the recipe isn't on the user's team.
impl FromRequestParts<AppState> for TeamRecipe {
    type Rejection = ApiError;

    #[tracing::instrument(name = "TeamRecipe", skip_all, fields(sentry.op = "extract"))]
    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        let Path(RecipePath { recipe_id }) = Path::from_request_parts(parts, state)
            .await
            .map_err(|err| ApiError::Validation(err.body_text()))?;
        let team = Team::from_request_parts(parts, state).await?;

        let client = state.pool.get().await?;
        let exists = recipe_exists()
            .bind(&client, &recipe_id, &team.id)
            .one()
            .await?;
        if !exists {
            return Err(ApiError::NotFound);
        }

        Ok(TeamRecipe {
            id: recipe_id,
            team_id: team.id,
        })
    }
}
