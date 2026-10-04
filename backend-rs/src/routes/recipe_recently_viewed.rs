//! Port of `recipeyak.api.recipe_recently_viewed_view`.

use axum::Json;
use axum::extract::State;
use chrono::{DateTime, Utc};
use serde::Serialize;
use utoipa::ToSchema;

use crate::AppState;
use crate::auth::AuthUser;
use crate::error::ApiError;
use crate::{json, storage, team};

#[derive(Debug, Serialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct PrimaryImage {
    id: i32,
    url: String,
    #[schema(required = true)]
    background_url: Option<String>,
}

#[derive(Debug, Serialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct RecipeRecentlyViewedItem {
    id: i32,
    name: String,
    #[schema(required = true)]
    author: Option<String>,
    #[serde(serialize_with = "json::serialize_option_datetime")]
    #[schema(required = true)]
    archived_at: Option<DateTime<Utc>>,
    #[schema(required = true)]
    primary_image: Option<PrimaryImage>,
}

#[utoipa::path(
    get,
    path = "/api/v1/recipes/recently_viewed",
    operation_id = "RecipeRecentlyViewed",
    responses(
        (status = 200, description = "Successful response.", body = Vec<RecipeRecentlyViewedItem>),
    ),
)]
pub async fn recipe_recently_viewed(
    State(state): State<AppState>,
    user: AuthUser,
) -> Result<Json<Vec<RecipeRecentlyViewedItem>>, ApiError> {
    let team_id = team::get_team_id(&state.pool, &user).await?;

    let rows = sqlx::query!(
        r#"
        SELECT
            r.id,
            r.name,
            r.author,
            r.archived_at,
            u.id AS "primary_image_id?",
            u.key AS "primary_image_key?",
            u.background_url AS "primary_image_background_url?"
        FROM recipe_view rv
        JOIN core_recipe r ON r.id = rv.recipe_id
        LEFT JOIN core_upload u ON u.id = r.primary_image_id
        WHERE rv.user_id = $1
          AND r.team_id = $2
        ORDER BY rv.last_visited_at DESC
        LIMIT 6
        "#,
        user.id,
        team_id
    )
    .fetch_all(&state.pool)
    .await?;

    let recipes = rows
        .into_iter()
        .map(|row| RecipeRecentlyViewedItem {
            id: row.id,
            name: row.name,
            author: row.author,
            archived_at: row.archived_at,
            primary_image: row
                .primary_image_id
                .zip(row.primary_image_key)
                .map(|(id, key)| PrimaryImage {
                    id,
                    url: storage::public_url(&state.config.storage_url, &key),
                    background_url: row.primary_image_background_url,
                }),
        })
        .collect();

    Ok(Json(recipes))
}
