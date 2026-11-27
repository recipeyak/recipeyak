//! POST /api/v1/calendars/{calendar_id}/pin/

mod common;

use axum::http::StatusCode;
use common::{Setup, TestDb, create_account, create_calendar, query_one, setup};
use serde_json::json;

async fn pinned_calendar_id(db: &TestDb, user_id: i32) -> Option<i32> {
    query_one(
        db,
        "SELECT pinned_calendar_id FROM core_myuser WHERE id = $1",
        &[&user_id],
    )
    .await
    .get(0)
}

#[tokio::test]
async fn pins_team_calendar() {
    let Setup { db, account, app } = setup().await;
    let lunches = create_calendar(&db, account.team_id, "Lunches").await;

    let response = app
        .post(&format!("/api/v1/calendars/{lunches}/pin/"), json!({}))
        .await;

    assert_eq!(response.status, StatusCode::NO_CONTENT);
    assert_eq!(
        pinned_calendar_id(&db, account.user_id).await,
        Some(lunches)
    );
}

#[tokio::test]
async fn other_teams_calendar_is_not_found() {
    let Setup { db, account, app } = setup().await;
    let other_team = create_account(&db, "bob@example.com").await;

    let response = app
        .post(
            &format!("/api/v1/calendars/{}/pin/", other_team.calendar_id),
            json!({}),
        )
        .await;

    assert_eq!(response.status, StatusCode::NOT_FOUND);
    assert_eq!(
        pinned_calendar_id(&db, account.user_id).await,
        Some(account.calendar_id)
    );
}
