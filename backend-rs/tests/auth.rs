mod common;

use axum::http::StatusCode;
use chrono::{Duration, Utc};
use common::{SECRET_KEY, TestApp};
use recipeyak::django::session::{self, MODEL_BACKEND, SESSION_SALT, SessionData};
use recipeyak::django::signing;
use serde_json::json;

const PATH: &str = "/api/v1/recipes/recently_viewed";

fn assert_not_authenticated(status: StatusCode, body: &serde_json::Value) {
    assert_eq!(status, StatusCode::FORBIDDEN);
    assert_eq!(
        body,
        &json!({
            "error": {
                "message": "Authentication credentials were not provided.",
                "code": "not_authenticated",
            },
            "message": "Authentication credentials were not provided.",
            "non_field_errors": ["Authentication credentials were not provided."],
        })
    );
}

#[tokio::test]
async fn missing_cookie() {
    let app = TestApp::new().await;
    let (res, body) = app.get(PATH, None).await;
    assert_not_authenticated(res.status(), &body);
}

#[tokio::test]
async fn unknown_session() {
    let app = TestApp::new().await;
    let (res, body) = app.get(PATH, Some("does-not-exist")).await;
    assert_not_authenticated(res.status(), &body);
}

#[tokio::test]
async fn valid_session() {
    let app = TestApp::new().await;
    let team_id = app.create_team().await;
    let user = app.create_user(team_id).await;
    let session_key = app.login(&user).await;

    let (res, _) = app.get(PATH, Some(&session_key)).await;
    assert_eq!(res.status(), StatusCode::OK);
}

#[tokio::test]
async fn expired_session() {
    let app = TestApp::new().await;
    let team_id = app.create_team().await;
    let user = app.create_user(team_id).await;
    let data = SessionData {
        user_id: user.id.to_string(),
        backend: MODEL_BACKEND.to_owned(),
        hash: session::session_auth_hash(&user.password, SECRET_KEY),
    };
    let session_data = session::encode(&data, SECRET_KEY).unwrap();
    let session_key = app
        .create_session(user.id, &session_data, Utc::now() - Duration::seconds(1))
        .await;

    let (res, body) = app.get(PATH, Some(&session_key)).await;
    assert_not_authenticated(res.status(), &body);
}

#[tokio::test]
async fn session_signed_with_other_secret() {
    let app = TestApp::new().await;
    let team_id = app.create_team().await;
    let user = app.create_user(team_id).await;
    let data = SessionData {
        user_id: user.id.to_string(),
        backend: MODEL_BACKEND.to_owned(),
        hash: session::session_auth_hash(&user.password, SECRET_KEY),
    };
    let session_data = session::encode(&data, "some-other-secret").unwrap();
    let session_key = app
        .create_session(user.id, &session_data, Utc::now() + Duration::days(1))
        .await;

    let (res, body) = app.get(PATH, Some(&session_key)).await;
    assert_not_authenticated(res.status(), &body);
}

#[tokio::test]
async fn password_changed_since_login() {
    let app = TestApp::new().await;
    let team_id = app.create_team().await;
    let user = app.create_user(team_id).await;
    let session_key = app.login(&user).await;

    sqlx::query("UPDATE core_myuser SET password = 'changed' WHERE id = $1")
        .bind(user.id)
        .execute(&app.pool)
        .await
        .unwrap();

    let (res, body) = app.get(PATH, Some(&session_key)).await;
    assert_not_authenticated(res.status(), &body);
}

#[tokio::test]
async fn logged_out_session() {
    // Django's `logout()` flushes the session data.
    let app = TestApp::new().await;
    let team_id = app.create_team().await;
    let user = app.create_user(team_id).await;
    let session_data = signing::dumps(&json!({}), SECRET_KEY, SESSION_SALT).unwrap();
    let session_key = app
        .create_session(user.id, &session_data, Utc::now() + Duration::days(1))
        .await;

    let (res, body) = app.get(PATH, Some(&session_key)).await;
    assert_not_authenticated(res.status(), &body);
}
