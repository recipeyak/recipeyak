//! Port of `recipeyak.api.scheduled_recipe_create_view`.
//!
//! POST /api/v1/calendar/

use axum::extract::State;
use chrono::NaiveDate;
use cornucopia::client::Params as _;
use cornucopia::queries::scheduled_recipe::{
    InsertScheduledRecipeParams, ScheduledRecipeParams, insert_scheduled_recipe, scheduled_recipe,
};
use serde::Deserialize;
use utoipa::ToSchema;

use crate::AppState;
use crate::db::Db;
use crate::error::{ApiError, OrNotFound};
use crate::extract::Json;
use crate::extract::calendar::Calendar;
use crate::extract::user::User;
use crate::realtime::publish_calendar_event;
use crate::routes::calendar::scheduled_recipe::ScheduledRecipe;

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
    db: Db,
    Json(ScheduledRecipeCreateParams { recipe, on }): Json<ScheduledRecipeCreateParams>,
) -> Result<Json<ScheduledRecipe>, ApiError> {
    let id = insert_scheduled_recipe()
        .params(
            &db,
            &InsertScheduledRecipeParams {
                on,
                team_id: calendar.team_id,
                calendar_id: calendar.id,
                user_id: user.id,
                recipe_id: recipe,
            },
        )
        .opt()
        .await?
        .or_not_found()?;
    let row = scheduled_recipe()
        .params(
            &db,
            &ScheduledRecipeParams {
                id,
                team_id: calendar.team_id,
            },
        )
        .one()
        .await?;
    let res = ScheduledRecipe::from_row(row, &state.config.storage_url, user.id, calendar.team_id);

    publish_calendar_event(&state, &res, calendar.team_id, calendar.id).await;
    Ok(Json(res))
}
