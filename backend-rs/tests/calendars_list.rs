//! GET /api/v1/calendars/

mod common;

use axum::http::StatusCode;
use common::{TestApp, TestDb, create_account, create_calendar, login};
use serde_json::json;

#[tokio::test]
async fn returns_team_calendars_by_name_with_pinned_flag() {
    let db = TestDb::new().await;
    let account = create_account(&db, "alice@example.com").await;
    let lunches = create_calendar(&db, account.team_id, "Lunches").await;
    // another team's calendar isn't listed
    create_account(&db, "bob@example.com").await;
    let session_key = login(&db, account.user_id).await;
    let app = TestApp::new(&db);

    let response = app.get("/api/v1/calendars/", Some(&session_key)).await;

    assert_eq!(response.status, StatusCode::OK);
    assert_eq!(
        response.json(),
        json!({
            "calendars": [
                {"id": account.calendar_id, "name": "Dinners", "pinned": true},
                {"id": lunches, "name": "Lunches", "pinned": false},
            ]
        })
    );
}
