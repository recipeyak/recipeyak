//! POST /api/v1/calendar/

mod common;

use axum::http::StatusCode;
use common::{TestApp, TestDb, create_account, create_recipe, login, query_one};
use serde_json::json;

#[tokio::test]
async fn schedules_recipe_on_pinned_calendar_and_publishes_it() {
    let db = TestDb::new().await;
    let account = create_account(&db, "alice@example.com").await;
    let recipe_id = create_recipe(&db, account.team_id, "Pancakes").await;
    let session_key = login(&db, account.user_id).await;
    let app = TestApp::new(&db);

    let response = app
        .post(
            "/api/v1/calendar/",
            Some(&session_key),
            json!({"recipe": recipe_id, "on": "2026-10-05"}),
        )
        .await;

    assert_eq!(response.status, StatusCode::OK);
    let scheduled = response.json();
    assert_eq!(scheduled["on"], "2026-10-05");
    assert_eq!(scheduled["recipe"]["id"], recipe_id);
    assert_eq!(scheduled["createdBy"]["id"], account.user_id);
    let id = scheduled["id"].as_i64().unwrap() as i32;
    let row = query_one(
        &db,
        "SELECT calendar_id, team_id, created_by_id, recipe_id FROM core_scheduledrecipe WHERE id = $1",
        &[&id],
    )
    .await;
    assert_eq!(
        (
            row.get::<_, i32>(0),
            row.get::<_, i32>(1),
            row.get::<_, i32>(2),
            row.get::<_, i32>(3)
        ),
        (
            account.calendar_id,
            account.team_id,
            account.user_id,
            recipe_id
        )
    );
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
    assert_eq!(published[0].data, scheduled);
}

#[tokio::test]
async fn other_teams_recipe_is_not_found() {
    let db = TestDb::new().await;
    let account = create_account(&db, "alice@example.com").await;
    let other_team = create_account(&db, "bob@example.com").await;
    let recipe_id = create_recipe(&db, other_team.team_id, "Pancakes").await;
    let session_key = login(&db, account.user_id).await;
    let app = TestApp::new(&db);

    let response = app
        .post(
            "/api/v1/calendar/",
            Some(&session_key),
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
