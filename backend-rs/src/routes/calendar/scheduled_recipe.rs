//! The scheduled recipe response, ported from
//! `recipeyak.api.calendar_serialization`.

use chrono::{DateTime, NaiveDate, Utc};
use cornucopia::queries::scheduled_recipe::ScheduledRecipe as Row;
use serde::Serialize;
use url::Url;
use utoipa::ToSchema;

use crate::urls::{avatar_url, public_url};

#[derive(Serialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct ScheduledRecipe {
    id: i32,
    created: DateTime<Utc>,
    #[schema(required)]
    created_by: Option<CreatedBy>,
    team: i32,
    user: i32,
    recipe: RecipeMetadata,
    on: NaiveDate,
}

#[derive(Serialize, ToSchema)]
struct CreatedBy {
    id: i32,
    name: String,
    avatar_url: String,
}

#[derive(Serialize, ToSchema)]
#[serde(rename_all = "camelCase")]
struct RecipeMetadata {
    id: i32,
    name: String,
    #[schema(required)]
    author: Option<String>,
    #[schema(required)]
    archived_at: Option<DateTime<Utc>>,
    #[schema(required)]
    primary_image: Option<PrimaryImage>,
}

#[derive(Serialize, ToSchema)]
#[serde(rename_all = "camelCase")]
struct PrimaryImage {
    id: String,
    url: String,
    #[schema(required)]
    background_url: Option<String>,
}

impl ScheduledRecipe {
    pub fn from_row(row: Row, storage_url: &Url, user_id: i32, team_id: i32) -> Self {
        Self {
            id: row.id,
            created: row.created,
            created_by: row.created_by_id.map(|id| {
                let email = row.created_by_email.unwrap_or_default();
                CreatedBy {
                    id,
                    avatar_url: avatar_url(
                        storage_url,
                        &email,
                        row.created_by_profile_key.as_deref(),
                    ),
                    // User.get_display_name
                    name: row
                        .created_by_name
                        .filter(|n| !n.is_empty())
                        .unwrap_or(email),
                }
            }),
            team: team_id,
            user: user_id,
            recipe: RecipeMetadata {
                id: row.recipe_id,
                name: row.recipe_name,
                author: row.recipe_author,
                archived_at: row.recipe_archived_at,
                primary_image: row.image_id.map(|id| PrimaryImage {
                    id: id.to_string(),
                    url: public_url(storage_url, row.image_key.as_deref().unwrap_or_default()),
                    background_url: row.image_background_url,
                }),
            },
            on: row.on,
        }
    }
}
