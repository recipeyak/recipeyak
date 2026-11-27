//! POST /api/v1/calendar/

mod common;

use axum::http::StatusCode;
use chrono::NaiveDate;
use common::{Setup, create_account, create_recipe, query_one, setup};
use serde_json::json;

#[tokio::test]
async fn schedules_recipe_on_pinned_calendar() {
    let Setup { db, account, app } = setup().await;
    let recipe_id = create_recipe(&db, account.team_id, "Pancakes").await;

    let response = app
        .post(
            "/api/v1/calendar/",
            json!({"recipe": recipe_id, "on": "2026-10-05"}),
        )
        .await;

    assert_eq!(response.status, StatusCode::OK);
    let id = response.json()["id"].as_i64().unwrap() as i32;
    let row = query_one(
        &db,
        "SELECT recipe_id, \"on\", calendar_id, created_by_id FROM core_scheduledrecipe WHERE id = $1",
        &[&id],
    )
    .await;
    assert_eq!(
        (
            row.get::<_, i32>(0),
            row.get::<_, NaiveDate>(1),
            row.get::<_, i32>(2),
            row.get::<_, i32>(3)
        ),
        (
            recipe_id,
            "2026-10-05".parse().unwrap(),
            account.calendar_id,
            account.user_id
        )
    );
}

#[tokio::test]
async fn publishes_scheduled_recipe_to_calendar_channel() {
    let Setup { db, account, app } = setup().await;
    let recipe_id = create_recipe(&db, account.team_id, "Pancakes").await;

    let response = app
        .post(
            "/api/v1/calendar/",
            json!({"recipe": recipe_id, "on": "2026-10-05"}),
        )
        .await;

    let published = app.ably.published();
    assert_eq!(published.len(), 1);
    assert_eq!(
        published[0].path,
        format!(
            "/channels/team:{}:calendar:{}:scheduled_recipe/messages",
            account.team_id, account.calendar_id
        )
    );
    assert_eq!(published[0].name, "scheduled_recipe_updated");
    assert_eq!(published[0].data, response.json());
}

#[tokio::test]
async fn other_teams_recipe_is_not_found() {
    let Setup { db, app, .. } = setup().await;
    let other_team = create_account(&db, "bob@example.com").await;
    let recipe_id = create_recipe(&db, other_team.team_id, "Pancakes").await;

    let response = app
        .post(
            "/api/v1/calendar/",
            json!({"recipe": recipe_id, "on": "2026-10-05"}),
        )
        .await;

    assert_eq!(response.status, StatusCode::NOT_FOUND);
    let count: i64 = query_one(&db, "SELECT count(*) FROM core_scheduledrecipe", &[])
        .await
        .get(0);
    assert_eq!(count, 0);
    assert!(app.ably.published().is_empty());
}
