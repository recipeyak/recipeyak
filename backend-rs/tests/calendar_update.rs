//! PATCH /api/v1/calendar/{scheduled_recipe_id}/

mod common;

use axum::http::StatusCode;
use chrono::NaiveDate;
use common::{
    Account, TestApp, TestDb, create_account, create_calendar, create_recipe, login, query_one,
    schedule_recipe,
};
use serde_json::json;

fn date(s: &str) -> NaiveDate {
    s.parse().unwrap()
}

#[tokio::test]
async fn moves_scheduled_recipe_and_records_event() {
    let db = TestDb::new().await;
    let account = create_account(&db, "alice@example.com").await;
    let recipe_id = create_recipe(&db, account.team_id, "Pancakes").await;
    let scheduled_id = schedule_recipe(&db, &account, recipe_id, date("2026-10-05")).await;
    let session_key = login(&db, account.user_id).await;
    let app = TestApp::new(&db);

    let response = app
        .patch(
            &format!("/api/v1/calendar/{scheduled_id}/"),
            Some(&session_key),
            json!({"on": "2026-10-09"}),
        )
        .await;

    assert_eq!(response.status, StatusCode::OK);
    assert_eq!(response.json()["id"], scheduled_id);
    assert_eq!(response.json()["on"], "2026-10-09");
    let on: NaiveDate = query_one(
        &db,
        "SELECT \"on\" FROM core_scheduledrecipe WHERE id = $1",
        &[&scheduled_id],
    )
    .await
    .get(0);
    assert_eq!(on, date("2026-10-09"));
    let event = query_one(
        &db,
        "SELECT before_on, after_on, actor_id FROM schedule_event WHERE scheduled_recipe_id = $1",
        &[&scheduled_id],
    )
    .await;
    assert_eq!(
        (
            event.get::<_, NaiveDate>(0),
            event.get::<_, NaiveDate>(1),
            event.get::<_, i32>(2)
        ),
        (date("2026-10-05"), date("2026-10-09"), account.user_id)
    );
    let published = app.ably.published();
    assert_eq!(published.len(), 1);
    assert_eq!(published[0].name, "scheduled_recipe_updated");
    assert_eq!(published[0].data, response.json());
}

#[tokio::test]
async fn scheduled_recipe_on_another_calendar_is_not_found() {
    let db = TestDb::new().await;
    let account = create_account(&db, "alice@example.com").await;
    let other_calendar = Account {
        calendar_id: create_calendar(&db, account.team_id, "Lunches").await,
        ..account
    };
    let recipe_id = create_recipe(&db, account.team_id, "Pancakes").await;
    let scheduled_id = schedule_recipe(&db, &other_calendar, recipe_id, date("2026-10-05")).await;
    let session_key = login(&db, account.user_id).await;
    let app = TestApp::new(&db);

    let response = app
        .patch(
            &format!("/api/v1/calendar/{scheduled_id}/"),
            Some(&session_key),
            json!({"on": "2026-10-09"}),
        )
        .await;

    assert_eq!(response.status, StatusCode::NOT_FOUND);
    let events: i64 = query_one(&db, "SELECT count(*) FROM schedule_event", &[])
        .await
        .get(0);
    assert_eq!(events, 0);
    assert!(app.ably.published().is_empty());
}
