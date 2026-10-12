//! Authenticating requests with the Django session cookie, exercised through
//! an endpoint that requires a user.

mod common;

use axum::http::StatusCode;
use common::{TestApp, TestDb, create_account, execute, login};

const URI: &str = "/api/v1/calendar/?start=2026-10-01&end=2026-10-07";

#[tokio::test]
async fn request_without_session_cookie_is_not_authenticated() {
    let db = TestDb::new().await;
    let app = TestApp::new(&db);

    let response = app.get(URI, None).await;

    assert_eq!(response.status, StatusCode::FORBIDDEN);
    assert_eq!(response.json()["error"]["code"], "not_authenticated");
}

#[tokio::test]
async fn request_with_unknown_session_key_is_not_authenticated() {
    let db = TestDb::new().await;
    let app = TestApp::new(&db);

    let response = app.get(URI, Some("doesnotexist12345")).await;

    assert_eq!(response.status, StatusCode::FORBIDDEN);
}

#[tokio::test]
async fn request_with_valid_session_is_authenticated() {
    let db = TestDb::new().await;
    let account = create_account(&db, "alice@example.com").await;
    let session_key = login(&db, account.user_id).await;
    let app = TestApp::new(&db);

    let response = app.get(URI, Some(&session_key)).await;

    assert_eq!(response.status, StatusCode::OK);
}

#[tokio::test]
async fn request_with_expired_session_is_not_authenticated() {
    let db = TestDb::new().await;
    let account = create_account(&db, "alice@example.com").await;
    let session_key = login(&db, account.user_id).await;
    execute(
        &db,
        "UPDATE user_sessions_session SET expire_date = now() - interval '1 second'",
        &[],
    )
    .await;
    let app = TestApp::new(&db);

    let response = app.get(URI, Some(&session_key)).await;

    assert_eq!(response.status, StatusCode::FORBIDDEN);
}

#[tokio::test]
async fn request_with_anonymous_session_is_not_authenticated() {
    let db = TestDb::new().await;
    let session_key = "anonymoussession12345";
    execute(
        &db,
        "INSERT INTO user_sessions_session (session_key, session_data, expire_date, last_activity)
         VALUES ($1, '', now() + interval '1 day', now())",
        &[&session_key],
    )
    .await;
    let app = TestApp::new(&db);

    let response = app.get(URI, Some(session_key)).await;

    assert_eq!(response.status, StatusCode::FORBIDDEN);
}
