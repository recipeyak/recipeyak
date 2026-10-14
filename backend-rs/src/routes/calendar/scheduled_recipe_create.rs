//! Port of `recipeyak.api.scheduled_recipe_create_view`.
//!
//! POST /api/v1/calendar/

use axum::Json;
use axum::extract::State;
use chrono::NaiveDate;
use cornucopia::queries::scheduled_recipe::{insert_scheduled_recipe, scheduled_recipe};
use serde::Deserialize;
use utoipa::ToSchema;

use crate::AppState;
use crate::error::ApiError;
use crate::extract::calendar::Calendar;
use crate::extract::user::User;
use crate::realtime::publish_calendar_event;
use crate::routes::calendar::serialization::{ScheduledRecipe, serialize_scheduled_recipe};

#[derive(Deserialize, ToSchema)]
#[serde(deny_unknown_fields)]
pub struct ScheduledRecipeCreateParams {
    recipe: i32,
    on: NaiveDate,
}

#[utoipa::path(
    post,
    path = "/api/v1/calendar/",
    operation_id = "ScheduledRecipeCreate",
    request_body = ScheduledRecipeCreateParams,
    responses((status = 200, description = "Successful response.", body = ScheduledRecipe)),
)]
pub async fn scheduled_recipe_create_view(
    State(state): State<AppState>,
    user: User,
    calendar: Calendar,
    Json(ScheduledRecipeCreateParams { recipe, on }): Json<ScheduledRecipeCreateParams>,
) -> Result<Json<ScheduledRecipe>, ApiError> {
    let client = state.pool.get().await?;
    let id = insert_scheduled_recipe()
        .bind(
            &client,
            &on,
            &calendar.team_id,
            &calendar.id,
            &user.id,
            &recipe,
        )
        .opt()
        .await?
        .ok_or(ApiError::NotFound)?;
    let row = scheduled_recipe().bind(&client, &id).one().await?;
    let res = serialize_scheduled_recipe(row, &state.config.storage_url, user.id, calendar.team_id);

    publish_calendar_event(&state, &res, calendar.team_id, calendar.id).await;
    Ok(Json(res))
}
