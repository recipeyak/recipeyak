//! DELETE /api/v1/calendar/{scheduled_recipe_id}/

mod common;

use axum::http::StatusCode;
use chrono::NaiveDate;
use common::{
    TestApp, TestDb, create_account, create_recipe, execute, login, query_one, schedule_recipe,
};
use serde_json::json;

fn date(s: &str) -> NaiveDate {
    s.parse().unwrap()
}

async fn scheduled_recipe_exists(db: &TestDb, id: i32) -> bool {
    query_one(
        db,
        "SELECT EXISTS (SELECT 1 FROM core_scheduledrecipe WHERE id = $1)",
        &[&id],
    )
    .await
    .get(0)
}

#[tokio::test]
async fn deletes_rescheduled_recipe_and_publishes_it() {
    let db = TestDb::new().await;
    let account = create_account(&db, "alice@example.com").await;
    let recipe_id = create_recipe(&db, account.team_id, "Pancakes").await;
    let scheduled_id = schedule_recipe(&db, &account, recipe_id, date("2026-10-05")).await;
    execute(
        &db,
        "INSERT INTO schedule_event (scheduled_recipe_id, before_on, after_on, actor_id, created, modified)
         VALUES ($1, '2026-10-04', '2026-10-05', $2, now(), now())",
        &[&scheduled_id, &account.user_id],
    )
    .await;
    let session_key = login(&db, account.user_id).await;
    let app = TestApp::new(&db);

    let response = app
        .delete(
            &format!("/api/v1/calendar/{scheduled_id}/"),
            Some(&session_key),
        )
        .await;

    assert_eq!(response.status, StatusCode::NO_CONTENT);
    assert!(!scheduled_recipe_exists(&db, scheduled_id).await);
    let published = app.ably.published();
    assert_eq!(published.len(), 1);
    assert_eq!(
        published[0].path,
        format!(
            "/channels/team:{}:calendar:{}:scheduled_recipe/messages",
            account.team_id, account.calendar_id
        )
    );
    // base64("app.key:secret")
    assert_eq!(published[0].authorization, "Basic YXBwLmtleTpzZWNyZXQ=");
    assert_eq!(published[0].name, "scheduled_recipe_delete");
    assert_eq!(published[0].data, json!({"recipeId": scheduled_id}));
}

#[tokio::test]
async fn other_teams_scheduled_recipe_is_kept() {
    let db = TestDb::new().await;
    let account = create_account(&db, "alice@example.com").await;
    let other_team = create_account(&db, "bob@example.com").await;
    let recipe_id = create_recipe(&db, other_team.team_id, "Pancakes").await;
    let scheduled_id = schedule_recipe(&db, &other_team, recipe_id, date("2026-10-05")).await;
    let session_key = login(&db, account.user_id).await;
    let app = TestApp::new(&db);

    let response = app
        .delete(
            &format!("/api/v1/calendar/{scheduled_id}/"),
            Some(&session_key),
        )
        .await;

    assert_eq!(response.status, StatusCode::NO_CONTENT);
    assert!(scheduled_recipe_exists(&db, scheduled_id).await);
}
