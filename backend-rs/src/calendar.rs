//! Port of `recipeyak.api.calendar_list_view`.
//!
//! GET /api/v1/calendar/?start=YYYY-MM-DD&end=YYYY-MM-DD

use axum::Json;
use axum::extract::State;
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};

use crate::AppState;
use crate::error::ApiError;
use crate::params::Params;
use crate::pinned_calendar::Calendar;
use crate::session::User;
use crate::urls::{avatar_url, public_url};

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CalendarListParams {
    start: NaiveDate,
    end: NaiveDate,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CalendarListResponse {
    scheduled_recipes: Vec<ScheduledRecipe>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ScheduledRecipe {
    id: i32,
    created: DateTime<Utc>,
    created_by: Option<CreatedBy>,
    team: Option<i32>,
    user: Option<i32>,
    recipe: RecipeMetadata,
    on: NaiveDate,
}

#[derive(Serialize)]
struct CreatedBy {
    id: i32,
    name: String,
    avatar_url: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct RecipeMetadata {
    id: i32,
    name: String,
    author: Option<String>,
    archived_at: Option<DateTime<Utc>>,
    primary_image: Option<PrimaryImage>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct PrimaryImage {
    id: String,
    url: String,
    background_url: Option<String>,
}

#[derive(sqlx::FromRow)]
struct Row {
    id: i32,
    created: DateTime<Utc>,
    on: NaiveDate,
    recipe_id: i32,
    recipe_name: String,
    recipe_author: Option<String>,
    recipe_archived_at: Option<DateTime<Utc>>,
    image_id: Option<i32>,
    image_key: Option<String>,
    image_background_url: Option<String>,
    created_by_id: Option<i32>,
    created_by_name: Option<String>,
    created_by_email: Option<String>,
    created_by_profile_key: Option<String>,
}

// Same joins as the view's `select_related("recipe__primary_image",
// "created_by__profile_upload")`, and the model's `ordering = ["-on"]`.
const SCHEDULED_RECIPES_SQL: &str = r#"
SELECT
    sr.id,
    sr.created,
    sr."on",
    sr.recipe_id,
    r.name AS recipe_name,
    r.author AS recipe_author,
    r.archived_at AS recipe_archived_at,
    image.id AS image_id,
    image.key AS image_key,
    image.background_url AS image_background_url,
    u.id AS created_by_id,
    u.name AS created_by_name,
    u.email::text AS created_by_email,
    profile.key AS created_by_profile_key
FROM core_scheduledrecipe sr
JOIN core_recipe r ON r.id = sr.recipe_id
LEFT JOIN core_upload image ON image.id = r.primary_image_id
LEFT JOIN core_myuser u ON u.id = sr.created_by_id
LEFT JOIN core_upload profile ON profile.id = u.profile_upload_id
WHERE sr.team_id = $1
  AND sr.calendar_id = $2
  AND sr."on" >= $3
  AND sr."on" <= $4
ORDER BY sr."on" DESC
"#;

pub async fn calendar_list_view(
    State(state): State<AppState>,
    user: User,
    Params(CalendarListParams { start, end }): Params<CalendarListParams>,
    calendar: Calendar,
) -> Result<Response, ApiError> {
    let rows: Vec<Row> = sqlx::query_as(SCHEDULED_RECIPES_SQL)
        .bind(calendar.team_id)
        .bind(calendar.id)
        .bind(start)
        .bind(end)
        .fetch_all(&state.pool)
        .await?;

    let hostname = &state.config.storage_hostname;
    let scheduled_recipes = rows
        .into_iter()
        .map(|row| ScheduledRecipe {
            id: row.id,
            created: row.created,
            created_by: row.created_by_id.map(|id| {
                let email = row.created_by_email.unwrap_or_default();
                CreatedBy {
                    id,
                    avatar_url: avatar_url(hostname, &email, row.created_by_profile_key.as_deref()),
                    // User.get_display_name
                    name: row
                        .created_by_name
                        .filter(|n| !n.is_empty())
                        .unwrap_or(email),
                }
            }),
            team: Some(calendar.team_id),
            user: Some(user.id),
            recipe: RecipeMetadata {
                id: row.recipe_id,
                name: row.recipe_name,
                author: row.recipe_author,
                archived_at: row.recipe_archived_at,
                primary_image: row.image_id.map(|id| PrimaryImage {
                    id: id.to_string(),
                    url: public_url(hostname, row.image_key.as_deref().unwrap_or_default()),
                    background_url: row.image_background_url,
                }),
            },
            on: row.on,
        })
        .collect();

    Ok((
        StatusCode::OK,
        Json(CalendarListResponse { scheduled_recipes }),
    )
        .into_response())
}
