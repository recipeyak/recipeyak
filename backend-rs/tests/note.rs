//! POST /api/v1/recipes/{recipe_id}/notes/, PATCH and DELETE /api/v1/notes/{note_id}/

mod common;

use axum::http::StatusCode;
use common::{
    TestApp, TestDb, add_member, create_account, create_note, create_recipe, create_upload,
    create_user, execute, login, query_one,
};
use serde_json::json;

#[tokio::test]
async fn create_note_with_attachments() {
    let db = TestDb::new().await;
    let account = create_account(&db, "alice@example.com").await;
    let other = create_account(&db, "bob@example.com").await;
    let recipe_id = create_recipe(&db, account.team_id, "Bread").await;
    let photo = create_upload(&db, account.user_id, "1/abc/crumb.jpg").await;
    let others_photo = create_upload(&db, other.user_id, "2/def/theirs.jpg").await;
    execute(
        &db,
        "UPDATE core_recipe SET primary_image_id = $2 WHERE id = $1",
        &[&recipe_id, &photo],
    )
    .await;
    let session_key = login(&db, account.user_id).await;
    let app = TestApp::new(&db);

    let response = app
        .post(
            &format!("/api/v1/recipes/{recipe_id}/notes/"),
            Some(&session_key),
            json!({
                "text": "more salt",
                "attachment_upload_ids": [photo.to_string(), others_photo.to_string()],
            }),
        )
        .await;

    assert_eq!(response.status, StatusCode::OK);
    let body = response.json();
    assert_eq!(body["text"], "more salt");
    assert_eq!(body["type"], "note");
    assert_eq!(
        body["created_by"],
        json!({
            "id": account.user_id,
            "name": "alice@example.com",
            "email": "alice@example.com",
            "avatar_url": "/avatar/c160f8cc69a4f0bf2b0362752353d060?d=identicon&r=g",
        })
    );
    assert_eq!(body["reactions"], json!([]));
    // Other users' uploads aren't attached.
    assert_eq!(
        body["attachments"],
        json!([{
            "id": photo.to_string(),
            "url": "https://images.test/1/abc/crumb.jpg",
            "backgroundUrl": null,
            "contentType": "image/jpeg",
            "isPrimary": true,
            "type": "upload",
        }])
    );

    let published = app.ably.published();
    assert_eq!(published.len(), 1);
    assert_eq!(
        published[0].path,
        format!(
            "/channels/team:{}:recipe:{recipe_id}/messages",
            account.team_id
        )
    );
    assert_eq!(published[0].name, "recipe_modified");
}

#[tokio::test]
async fn create_note_rejects_extra_params() {
    let db = TestDb::new().await;
    let account = create_account(&db, "alice@example.com").await;
    let recipe_id = create_recipe(&db, account.team_id, "Bread").await;
    let session_key = login(&db, account.user_id).await;
    let app = TestApp::new(&db);

    let response = app
        .post(
            &format!("/api/v1/recipes/{recipe_id}/notes/"),
            Some(&session_key),
            json!({"text": "great recipe!", "attachment_upload_ids": [], "foo": 1}),
        )
        .await;

    assert!(response.status.is_client_error(), "{}", response.status);
}

#[tokio::test]
async fn create_note_on_other_teams_recipe_is_not_found() {
    let db = TestDb::new().await;
    let account = create_account(&db, "alice@example.com").await;
    let other = create_account(&db, "bob@example.com").await;
    let recipe_id = create_recipe(&db, other.team_id, "Bread").await;
    let session_key = login(&db, account.user_id).await;
    let app = TestApp::new(&db);

    let response = app
        .post(
            &format!("/api/v1/recipes/{recipe_id}/notes/"),
            Some(&session_key),
            json!({"text": "mine now", "attachment_upload_ids": []}),
        )
        .await;

    assert_eq!(response.status, StatusCode::NOT_FOUND);
    let count = query_one(&db, "SELECT count(*) FROM core_note", &[]).await;
    assert_eq!(count.get::<_, i64>(0), 0);
}

#[tokio::test]
async fn update_note_records_version_and_replaces_attachments() {
    let db = TestDb::new().await;
    let account = create_account(&db, "alice@example.com").await;
    let recipe_id = create_recipe(&db, account.team_id, "Bread").await;
    let note_id = create_note(&db, recipe_id, account.user_id, "before").await;
    let old_photo = create_upload(&db, account.user_id, "1/a/old.jpg").await;
    let kept_photo = create_upload(&db, account.user_id, "1/b/kept.jpg").await;
    let new_photo = create_upload(&db, account.user_id, "1/c/new.jpg").await;
    execute(
        &db,
        "UPDATE core_upload SET note_id = $1 WHERE id = ANY($2)",
        &[&note_id, &vec![old_photo, kept_photo]],
    )
    .await;
    let session_key = login(&db, account.user_id).await;
    let app = TestApp::new(&db);

    let response = app
        .patch(
            &format!("/api/v1/notes/{note_id}/"),
            Some(&session_key),
            json!({
                "text": "after",
                "attachment_upload_ids": [kept_photo.to_string(), new_photo.to_string()],
            }),
        )
        .await;

    assert_eq!(response.status, StatusCode::OK);
    let body = response.json();
    assert_eq!(body["text"], "after");
    let attachment_ids: Vec<_> = body["attachments"]
        .as_array()
        .unwrap()
        .iter()
        .map(|a| a["id"].as_str().unwrap().parse::<i32>().unwrap())
        .collect();
    assert_eq!(attachment_ids, vec![kept_photo, new_photo]);

    let version = query_one(
        &db,
        "SELECT actor_id, text, upload_ids FROM note_historical WHERE note_id = $1",
        &[&note_id],
    )
    .await;
    assert_eq!(
        version.get::<_, Option<i32>>("actor_id"),
        Some(account.user_id)
    );
    assert_eq!(version.get::<_, String>("text"), "before");
    let mut upload_ids: Vec<i32> = version.get("upload_ids");
    upload_ids.sort();
    assert_eq!(upload_ids, vec![old_photo, kept_photo]);

    assert_eq!(app.ably.published().len(), 1);
}

#[tokio::test]
async fn update_note_ignores_empty_values() {
    let db = TestDb::new().await;
    let account = create_account(&db, "alice@example.com").await;
    let recipe_id = create_recipe(&db, account.team_id, "Bread").await;
    let note_id = create_note(&db, recipe_id, account.user_id, "keep me").await;
    let photo = create_upload(&db, account.user_id, "1/a/photo.jpg").await;
    execute(
        &db,
        "UPDATE core_upload SET note_id = $1 WHERE id = $2",
        &[&note_id, &photo],
    )
    .await;
    let session_key = login(&db, account.user_id).await;
    let app = TestApp::new(&db);

    let response = app
        .patch(
            &format!("/api/v1/notes/{note_id}/"),
            Some(&session_key),
            json!({"text": "", "attachment_upload_ids": []}),
        )
        .await;

    assert_eq!(response.status, StatusCode::OK);
    let body = response.json();
    assert_eq!(body["text"], "keep me");
    assert_eq!(body["attachments"].as_array().unwrap().len(), 1);
}

#[tokio::test]
async fn update_other_users_note() {
    let db = TestDb::new().await;
    let account = create_account(&db, "alice@example.com").await;
    let recipe_id = create_recipe(&db, account.team_id, "Bread").await;
    let note_id = create_note(&db, recipe_id, account.user_id, "mine").await;
    let teammate = create_user(&db, "carol@example.com").await;
    add_member(&db, account.team_id, teammate).await;
    execute(
        &db,
        "UPDATE core_myuser SET schedule_team_id = $2 WHERE id = $1",
        &[&teammate, &account.team_id],
    )
    .await;
    let outsider = create_account(&db, "bob@example.com").await;
    let app = TestApp::new(&db);

    let session_key = login(&db, teammate).await;
    let response = app
        .patch(
            &format!("/api/v1/notes/{note_id}/"),
            Some(&session_key),
            json!({"text": "theirs"}),
        )
        .await;
    assert_eq!(response.status, StatusCode::FORBIDDEN);
    assert_eq!(response.json()["error"]["code"], "missing_perms");

    let session_key = login(&db, outsider.user_id).await;
    let response = app
        .patch(
            &format!("/api/v1/notes/{note_id}/"),
            Some(&session_key),
            json!({"text": "theirs"}),
        )
        .await;
    assert_eq!(response.status, StatusCode::NOT_FOUND);

    let note = query_one(&db, "SELECT text FROM core_note WHERE id = $1", &[&note_id]).await;
    assert_eq!(note.get::<_, String>("text"), "mine");
}

#[tokio::test]
async fn delete_note() {
    let db = TestDb::new().await;
    let account = create_account(&db, "alice@example.com").await;
    let recipe_id = create_recipe(&db, account.team_id, "Bread").await;
    let note_id = create_note(&db, recipe_id, account.user_id, "bye").await;
    let photo = create_upload(&db, account.user_id, "1/a/photo.jpg").await;
    execute(
        &db,
        "UPDATE core_upload SET note_id = $1 WHERE id = $2",
        &[&note_id, &photo],
    )
    .await;
    execute(
        &db,
        "INSERT INTO core_reaction (emoji, created_by_id, note_id, created, modified)
         VALUES ('❤️', $1, $2, now(), now())",
        &[&account.user_id, &note_id],
    )
    .await;
    execute(
        &db,
        "INSERT INTO note_historical (note_id, actor_id, text, upload_ids, created, modified)
         VALUES ($1, $2, 'hi', '{}', now(), now())",
        &[&note_id, &account.user_id],
    )
    .await;
    let session_key = login(&db, account.user_id).await;
    let app = TestApp::new(&db);

    let response = app
        .delete(&format!("/api/v1/notes/{note_id}/"), Some(&session_key))
        .await;

    assert_eq!(response.status, StatusCode::NO_CONTENT);
    let row = query_one(
        &db,
        "SELECT
            (SELECT count(*) FROM core_note) AS notes,
            (SELECT count(*) FROM core_reaction) AS reactions,
            (SELECT count(*) FROM note_historical) AS versions,
            (SELECT note_id FROM core_upload WHERE id = $1) AS upload_note_id",
        &[&photo],
    )
    .await;
    assert_eq!(row.get::<_, i64>("notes"), 0);
    assert_eq!(row.get::<_, i64>("reactions"), 0);
    assert_eq!(row.get::<_, i64>("versions"), 0);
    assert_eq!(row.get::<_, Option<i32>>("upload_note_id"), None);
    assert_eq!(app.ably.published().len(), 1);
}

#[tokio::test]
async fn delete_other_users_note_is_noop() {
    let db = TestDb::new().await;
    let account = create_account(&db, "alice@example.com").await;
    let recipe_id = create_recipe(&db, account.team_id, "Bread").await;
    let note_id = create_note(&db, recipe_id, account.user_id, "mine").await;
    let teammate = create_user(&db, "carol@example.com").await;
    add_member(&db, account.team_id, teammate).await;
    execute(
        &db,
        "UPDATE core_myuser SET schedule_team_id = $2 WHERE id = $1",
        &[&teammate, &account.team_id],
    )
    .await;
    let session_key = login(&db, teammate).await;
    let app = TestApp::new(&db);

    let response = app
        .delete(&format!("/api/v1/notes/{note_id}/"), Some(&session_key))
        .await;

    assert_eq!(response.status, StatusCode::NO_CONTENT);
    let count = query_one(&db, "SELECT count(*) FROM core_note", &[]).await;
    assert_eq!(count.get::<_, i64>(0), 1);
    assert!(app.ably.published().is_empty());
}
