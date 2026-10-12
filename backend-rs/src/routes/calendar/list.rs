//! Port of `recipeyak.api.calendar_list_view`.
//!
//! GET /api/v1/calendar/?start=YYYY-MM-DD&end=YYYY-MM-DD

use axum::Json;
use axum::extract::State;
use chrono::{DateTime, NaiveDate, Utc};
use cornucopia::queries::scheduled_recipe::scheduled_recipes;
use serde::{Deserialize, Serialize};
use utoipa::{IntoParams, ToSchema};

use crate::AppState;
use crate::error::ApiError;
use crate::extract::calendar::Calendar;
use crate::extract::params::Params;
use crate::extract::user::User;
use crate::urls::{avatar_url, public_url};

#[derive(Deserialize, IntoParams)]
#[serde(deny_unknown_fields)]
#[into_params(parameter_in = Query)]
pub struct CalendarListParams {
    start: NaiveDate,
    end: NaiveDate,
}

#[derive(Serialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct CalendarListResponse {
    scheduled_recipes: Vec<ScheduledRecipe>,
}

#[derive(Serialize, ToSchema)]
#[serde(rename_all = "camelCase")]
struct ScheduledRecipe {
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

#[utoipa::path(
    get,
    path = "/api/v1/calendar/",
    operation_id = "CalendarList",
    params(CalendarListParams),
    responses((status = 200, description = "Successful response.", body = CalendarListResponse)),
)]
pub async fn calendar_list_view(
    State(state): State<AppState>,
    user: User,
    Params(CalendarListParams { start, end }): Params<CalendarListParams>,
    calendar: Calendar,
) -> Result<Json<CalendarListResponse>, ApiError> {
    let client = state.pool.get().await?;
    let rows = scheduled_recipes()
        .bind(&client, &calendar.team_id, &calendar.id, &start, &end)
        .all()
        .await?;

    let storage_url = &state.config.storage_url;
    let scheduled_recipes = rows
        .into_iter()
        .map(|row| ScheduledRecipe {
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
            team: calendar.team_id,
            user: user.id,
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
        })
        .collect();

    Ok(Json(CalendarListResponse { scheduled_recipes }))
}
