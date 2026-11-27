//! Bad request bodies and path params get Django's error responses.

mod common;

use axum::http::StatusCode;
use common::{TestApp, TestDb, create_account, login};
use serde_json::json;

#[tokio::test]
async fn invalid_body_is_validation_error() {
    let db = TestDb::new().await;
    let account = create_account(&db, "alice@example.com").await;
    let session_key = login(&db, account.user_id).await;
    let app = TestApp::new(&db);

    for body in [json!({}), json!({"name": 1}), json!({"name": "a", "x": 1})] {
        let response = app
            .post("/api/v1/calendars/", Some(&session_key), body.clone())
            .await;
        assert_eq!(response.status, StatusCode::BAD_REQUEST, "{body}");
        assert_eq!(response.json()["error"]["code"], "validation_error");
    }

    let response = app
        .post_raw(
            "/api/v1/calendars/",
            Some(&session_key),
            Some("application/json"),
            "{",
        )
        .await;
    assert_eq!(response.status, StatusCode::BAD_REQUEST);
    assert_eq!(response.json()["error"]["code"], "validation_error");
}

#[tokio::test]
async fn body_is_parsed_without_content_type() {
    let db = TestDb::new().await;
    let account = create_account(&db, "alice@example.com").await;
    let session_key = login(&db, account.user_id).await;
    let app = TestApp::new(&db);

    let response = app
        .post_raw(
            "/api/v1/calendars/",
            Some(&session_key),
            None,
            r#"{"name": "Lunches"}"#,
        )
        .await;

    assert_eq!(response.status, StatusCode::OK);
    assert_eq!(response.json()["name"], "Lunches");
}

#[tokio::test]
async fn non_integer_path_param_is_not_found() {
    let db = TestDb::new().await;
    let account = create_account(&db, "alice@example.com").await;
    let session_key = login(&db, account.user_id).await;
    let app = TestApp::new(&db);

    let response = app
        .patch(
            "/api/v1/calendar/abc/",
            Some(&session_key),
            json!({"on": "2026-10-09"}),
        )
        .await;

    assert_eq!(response.status, StatusCode::NOT_FOUND);
}
