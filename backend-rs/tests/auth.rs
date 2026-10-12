//! Authenticating requests with the Django session cookie, exercised through
//! an endpoint that requires a user.

mod common;

use axum::http::StatusCode;
use common::{TestApp, create_account, login};
use sqlx::PgPool;

const URI: &str = "/api/v1/calendar/?start=2026-10-01&end=2026-10-07";

#[sqlx::test(migrations = "tests/schema")]
async fn request_without_session_cookie_is_not_authenticated(pool: PgPool) {
    let app = TestApp::new(pool);

    let response = app.get(URI, None).await;

    assert_eq!(response.status, StatusCode::FORBIDDEN);
    assert_eq!(response.json()["error"]["code"], "not_authenticated");
}

#[sqlx::test(migrations = "tests/schema")]
async fn request_with_unknown_session_key_is_not_authenticated(pool: PgPool) {
    let app = TestApp::new(pool);

    let response = app.get(URI, Some("doesnotexist12345")).await;

    assert_eq!(response.status, StatusCode::FORBIDDEN);
}

#[sqlx::test(migrations = "tests/schema")]
async fn request_with_valid_session_is_authenticated(pool: PgPool) {
    let account = create_account(&pool, "alice@example.com").await;
    let session_key = login(&pool, account.user_id).await;
    let app = TestApp::new(pool);

    let response = app.get(URI, Some(&session_key)).await;

    assert_eq!(response.status, StatusCode::OK);
}

#[sqlx::test(migrations = "tests/schema")]
async fn request_with_expired_session_is_not_authenticated(pool: PgPool) {
    let account = create_account(&pool, "alice@example.com").await;
    let session_key = login(&pool, account.user_id).await;
    sqlx::query("UPDATE user_sessions_session SET expire_date = now() - interval '1 second'")
        .execute(&pool)
        .await
        .unwrap();
    let app = TestApp::new(pool);

    let response = app.get(URI, Some(&session_key)).await;

    assert_eq!(response.status, StatusCode::FORBIDDEN);
}

#[sqlx::test(migrations = "tests/schema")]
async fn request_with_anonymous_session_is_not_authenticated(pool: PgPool) {
    let session_key = "anonymoussession12345";
    sqlx::query(
        "INSERT INTO user_sessions_session (session_key, session_data, expire_date, last_activity)
         VALUES ($1, '', now() + interval '1 day', now())",
    )
    .bind(session_key)
    .execute(&pool)
    .await
    .unwrap();
    let app = TestApp::new(pool);

    let response = app.get(URI, Some(session_key)).await;

    assert_eq!(response.status, StatusCode::FORBIDDEN);
}
