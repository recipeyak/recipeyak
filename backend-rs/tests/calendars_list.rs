//! GET /api/v1/calendars/

mod common;

use axum::http::StatusCode;
use common::{Setup, create_account, create_calendar, setup};
use serde_json::json;

#[tokio::test]
async fn returns_team_calendars_by_name_with_pinned_flag() {
    let Setup { db, account, app } = setup().await;
    let lunches = create_calendar(&db, account.team_id, "Lunches").await;
    // another team's calendar isn't listed
    create_account(&db, "bob@example.com").await;

    let response = app.get("/api/v1/calendars/").await;

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
