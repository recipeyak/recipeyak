//! POST /api/v1/upload/ and POST /api/v1/upload/{upload_id}/complete

mod common;

use axum::http::StatusCode;
use common::{TestApp, TestDb, create_account, create_recipe, login, query_one};
use serde_json::json;

#[tokio::test]
async fn start_recipe_upload() {
    let db = TestDb::new().await;
    let account = create_account(&db, "alice@example.com").await;
    let recipe_id = create_recipe(&db, account.team_id, "Bread").await;
    let session_key = login(&db, account.user_id).await;
    let app = TestApp::new(&db);

    let response = app
        .post(
            "/api/v1/upload/",
            Some(&session_key),
            json!({
                "file_name": "IMG 1.jpg",
                "content_type": "image/jpeg",
                "content_length": 1234,
                "recipe_id": recipe_id,
            }),
        )
        .await;

    assert_eq!(response.status, StatusCode::OK);
    let body = response.json();
    let id = body["id"].as_i64().unwrap() as i32;
    assert_eq!(
        body["upload_headers"],
        json!({"x-amz-meta-db_id": id.to_string()})
    );

    let row = query_one(
        &db,
        "SELECT created_by_id, bucket, key, recipe_id, profile_id, content_type, completed
         FROM core_upload WHERE id = $1",
        &[&id],
    )
    .await;
    assert_eq!(
        row.get::<_, Option<i32>>("created_by_id"),
        Some(account.user_id)
    );
    assert_eq!(row.get::<_, String>("bucket"), "test-bucket");
    assert_eq!(row.get::<_, Option<i32>>("recipe_id"), Some(recipe_id));
    assert_eq!(row.get::<_, Option<i32>>("profile_id"), None);
    assert_eq!(row.get::<_, String>("content_type"), "image/jpeg");
    assert!(!row.get::<_, bool>("completed"));
    let key: String = row.get("key");
    let prefix = format!("{}/", account.user_id);
    assert!(
        key.starts_with(&prefix) && key.ends_with("/IMG 1.jpg"),
        "{key}"
    );

    let url = body["upload_url"].as_str().unwrap();
    let path = key.replace(' ', "%20");
    assert!(
        url.starts_with(&format!(
            "https://test-bucket.s3.us-east-1.amazonaws.com/{path}?"
        )),
        "{url}"
    );
    assert!(
        url.contains("X-Amz-SignedHeaders=content-length%3Bcontent-type%3Bhost%3Bx-amz-meta-db_id"),
        "{url}"
    );
}

#[tokio::test]
async fn start_profile_upload() {
    let db = TestDb::new().await;
    let account = create_account(&db, "alice@example.com").await;
    let session_key = login(&db, account.user_id).await;
    let app = TestApp::new(&db);

    let response = app
        .post(
            "/api/v1/upload/",
            Some(&session_key),
            json!({
                "file_name": "me.png",
                "content_type": "image/png",
                "content_length": 10,
                "purpose": "profile",
            }),
        )
        .await;

    assert_eq!(response.status, StatusCode::OK);
    let id = response.json()["id"].as_i64().unwrap() as i32;
    let row = query_one(
        &db,
        "SELECT recipe_id, profile_id FROM core_upload WHERE id = $1",
        &[&id],
    )
    .await;
    assert_eq!(row.get::<_, Option<i32>>("recipe_id"), None);
    assert_eq!(
        row.get::<_, Option<i32>>("profile_id"),
        Some(account.user_id)
    );
}

#[tokio::test]
async fn start_validates_purpose_and_recipe_id() {
    let db = TestDb::new().await;
    let account = create_account(&db, "alice@example.com").await;
    let recipe_id = create_recipe(&db, account.team_id, "Bread").await;
    let session_key = login(&db, account.user_id).await;
    let app = TestApp::new(&db);

    for (body, message) in [
        (
            json!({"file_name": "a.jpg", "content_type": "image/jpeg", "content_length": 1}),
            "recipe_id is required when purpose is recipe",
        ),
        (
            json!({
                "file_name": "a.jpg",
                "content_type": "image/jpeg",
                "content_length": 1,
                "recipe_id": recipe_id,
                "purpose": "profile",
            }),
            "recipe_id is not allowed when purpose is profile",
        ),
    ] {
        let response = app.post("/api/v1/upload/", Some(&session_key), body).await;
        assert_eq!(response.status, StatusCode::BAD_REQUEST);
        assert_eq!(response.json()["error"]["message"], message);
    }
}

#[tokio::test]
async fn start_other_teams_recipe_is_not_found() {
    let db = TestDb::new().await;
    let account = create_account(&db, "alice@example.com").await;
    let other = create_account(&db, "bob@example.com").await;
    let recipe_id = create_recipe(&db, other.team_id, "Bread").await;
    let session_key = login(&db, account.user_id).await;
    let app = TestApp::new(&db);

    let response = app
        .post(
            "/api/v1/upload/",
            Some(&session_key),
            json!({
                "file_name": "a.jpg",
                "content_type": "image/jpeg",
                "content_length": 1,
                "recipe_id": recipe_id,
            }),
        )
        .await;

    assert_eq!(response.status, StatusCode::BAD_REQUEST);
    assert_eq!(response.json()["error"]["code"], "recipe_not_found");
    let count: i64 = query_one(&db, "SELECT count(*) FROM core_upload", &[])
        .await
        .get(0);
    assert_eq!(count, 0);
}

async fn start_upload(app: &TestApp, session_key: &str, body: serde_json::Value) -> i32 {
    let response = app.post("/api/v1/upload/", Some(session_key), body).await;
    assert_eq!(response.status, StatusCode::OK);
    response.json()["id"].as_i64().unwrap() as i32
}

#[tokio::test]
async fn complete_recipe_upload() {
    let db = TestDb::new().await;
    let account = create_account(&db, "alice@example.com").await;
    let recipe_id = create_recipe(&db, account.team_id, "Bread").await;
    let session_key = login(&db, account.user_id).await;
    let app = TestApp::new(&db);
    let id = start_upload(
        &app,
        &session_key,
        json!({
            "file_name": "IMG 1.jpg",
            "content_type": "image/jpeg",
            "content_length": 1,
            "recipe_id": recipe_id,
        }),
    )
    .await;

    let response = app
        .post(
            &format!("/api/v1/upload/{id}/complete"),
            Some(&session_key),
            json!({}),
        )
        .await;

    assert_eq!(response.status, StatusCode::OK);
    let row = query_one(
        &db,
        "SELECT key, completed FROM core_upload WHERE id = $1",
        &[&id],
    )
    .await;
    assert!(row.get::<_, bool>("completed"));
    let key: String = row.get("key");
    assert_eq!(
        response.json(),
        json!({
            "id": id.to_string(),
            "url": format!("https://images.test/{}", key.replace(' ', "%20")),
            "contentType": "image/jpeg",
        })
    );
    let profile_upload_id: Option<i32> = query_one(
        &db,
        "SELECT profile_upload_id FROM core_myuser WHERE id = $1",
        &[&account.user_id],
    )
    .await
    .get(0);
    assert_eq!(profile_upload_id, None);
}

#[tokio::test]
async fn complete_profile_upload_sets_avatar() {
    let db = TestDb::new().await;
    let account = create_account(&db, "alice@example.com").await;
    let session_key = login(&db, account.user_id).await;
    let app = TestApp::new(&db);
    let id = start_upload(
        &app,
        &session_key,
        json!({
            "file_name": "me.png",
            "content_type": "image/png",
            "content_length": 1,
            "purpose": "profile",
        }),
    )
    .await;

    let response = app
        .post(
            &format!("/api/v1/upload/{id}/complete"),
            Some(&session_key),
            json!({}),
        )
        .await;

    assert_eq!(response.status, StatusCode::OK);
    let profile_upload_id: Option<i32> = query_one(
        &db,
        "SELECT profile_upload_id FROM core_myuser WHERE id = $1",
        &[&account.user_id],
    )
    .await
    .get(0);
    assert_eq!(profile_upload_id, Some(id));
}

#[tokio::test]
async fn complete_other_users_upload_is_not_found() {
    let db = TestDb::new().await;
    let account = create_account(&db, "alice@example.com").await;
    let other = create_account(&db, "bob@example.com").await;
    let other_session_key = login(&db, other.user_id).await;
    let session_key = login(&db, account.user_id).await;
    let app = TestApp::new(&db);
    let id = start_upload(
        &app,
        &other_session_key,
        json!({
            "file_name": "me.png",
            "content_type": "image/png",
            "content_length": 1,
            "purpose": "profile",
        }),
    )
    .await;

    let response = app
        .post(
            &format!("/api/v1/upload/{id}/complete"),
            Some(&session_key),
            json!({}),
        )
        .await;

    assert_eq!(response.status, StatusCode::NOT_FOUND);
    let completed: bool = query_one(
        &db,
        "SELECT completed FROM core_upload WHERE id = $1",
        &[&id],
    )
    .await
    .get(0);
    assert!(!completed);
}
