//! Port of `recipeyak.realtime`, using Ably's REST API.
//!
//! Like Django, we publish after the change is committed and before
//! responding. Failures are logged instead of failing the request since the
//! change already happened.

use serde::Serialize;
use serde_json::json;

use crate::AppState;
use crate::routes::calendar::scheduled_recipe::ScheduledRecipe;

pub async fn publish_calendar_event(
    state: &AppState,
    scheduled_recipe: &ScheduledRecipe,
    team_id: i32,
    calendar_id: i32,
) {
    publish(
        state,
        &format!("team:{team_id}:calendar:{calendar_id}:scheduled_recipe"),
        "scheduled_recipe_updated",
        scheduled_recipe,
    )
    .await;
}

pub async fn publish_calendar_event_deleted(
    state: &AppState,
    recipe_id: i32,
    team_id: i32,
    calendar_id: i32,
) {
    publish(
        state,
        &format!("team:{team_id}:calendar:{calendar_id}:scheduled_recipe"),
        "scheduled_recipe_delete",
        &json!({"recipeId": recipe_id}),
    )
    .await;
}

pub async fn publish_recipe(state: &AppState, recipe_id: i32, team_id: i32) {
    publish(
        state,
        &format!("team:{team_id}:recipe:{recipe_id}"),
        "recipe_modified",
        &json!({"id": recipe_id}),
    )
    .await;
}

async fn publish(state: &AppState, channel: &str, name: &str, data: &impl Serialize) {
    let Some(api_key) = &state.config.ably_api_key else {
        tracing::warn!(
            channel,
            name,
            "RECIPEYAK_RS_ABLY_API_KEY not set, skipping publish"
        );
        return;
    };
    if let Err(err) = try_publish(state, api_key, channel, name, data).await {
        tracing::error!(error = %err, channel, name, "failed to publish to ably");
    }
}

async fn try_publish(
    state: &AppState,
    api_key: &str,
    channel: &str,
    name: &str,
    data: &impl Serialize,
) -> Result<(), Box<dyn std::error::Error>> {
    // Ably API keys are `{key name}:{key secret}`, used as basic auth.
    let (username, password) = api_key
        .split_once(':')
        .ok_or("invalid RECIPEYAK_RS_ABLY_API_KEY")?;
    let mut url = state.config.ably_url.clone();
    url.path_segments_mut()
        .map_err(|_| "invalid ably url")?
        .extend(["channels", channel, "messages"]);
    state
        .http
        .post(url)
        .basic_auth(username, Some(password))
        // The UI expects `data` to be a JSON encoded string.
        .json(&json!({"name": name, "data": serde_json::to_string(data)?}))
        .send()
        .await?
        .error_for_status()?;
    Ok(())
}
